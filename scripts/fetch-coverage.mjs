/**
 * Downloads OSM geometries into src/data/coverage.json.
 * Prefer urban/cabecera polygons; never use full municipal/rural boundaries
 * for the five towns that lack a dedicated perímetro urbano relation.
 * Never unions cities. Keeps Remoto as the Meta department polygon.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(root, "src/data/coverage.json");
const UA = "RoseTech-coverage/1.0 (https://github.com/RoseTech; OSM coverage fetch)";
const OVERPASS_ENDPOINTS = [
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const FIXED = [
  {
    name: "Villavicencio",
    osm: "R14699591",
    kind: "cabecera-urbana",
    source: "OSM relation Perímetro Urbano Villavicencio (admin_level=7)",
  },
  {
    name: "Puerto López",
    osm: "W234137717",
    kind: "cabecera-urbana",
    source: "OSM way place=town Puerto Lopez (urban outline)",
  },
];

const URBAN_TOWNS = [
  { name: "Acacías", lat: 3.9887317, lon: -73.767432, radiusM: 3200 },
  { name: "Restrepo", lat: 4.2597265, lon: -73.5654839, radiusM: 2800 },
  { name: "Cumaral", lat: 4.2711674, lon: -73.4877694, radiusM: 2600 },
  { name: "Granada", lat: 3.548259, lon: -73.7051174, radiusM: 3200 },
  { name: "San Martín", lat: 3.6943897, lon: -73.6952914, radiusM: 2800 },
];

const CITY_ORDER = [
  "Villavicencio",
  "Acacías",
  "Restrepo",
  "Cumaral",
  "Granada",
  "San Martín",
  "Puerto López",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function ringClosed(ring) {
  if (!Array.isArray(ring) || ring.length < 4) return false;
  const a = ring[0];
  const b = ring[ring.length - 1];
  return a[0] === b[0] && a[1] === b[1];
}

function looksCircular(geom) {
  const rings = [];
  if (geom?.type === "Polygon") rings.push(geom.coordinates[0]);
  else if (geom?.type === "MultiPolygon") {
    for (const poly of geom.coordinates) rings.push(poly[0]);
  } else return true;
  const ring = rings[0];
  if (!ring || ring.length < 8 || ring.length > 48) return false;
  const lats = ring.map((p) => p[1]);
  const lngs = ring.map((p) => p[0]);
  const lat0 = (Math.min(...lats) + Math.max(...lats)) / 2;
  const lng0 = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  const rs = ring.slice(0, -1).map((p) => Math.hypot(p[0] - lng0, p[1] - lat0));
  const mean = rs.reduce((a, b) => a + b, 0) / rs.length;
  const variance = rs.reduce((a, b) => a + (b - mean) ** 2, 0) / rs.length;
  return Math.sqrt(variance) / mean < 0.02;
}

function bboxSpanKm(geom) {
  const pts = [];
  const deep = (node) => {
    if (!Array.isArray(node)) return;
    if (typeof node[0] === "number") pts.push(node);
    else node.forEach(deep);
  };
  deep(geom.coordinates);
  if (!pts.length) return 0;
  const lats = pts.map((p) => p[1]);
  const lngs = pts.map((p) => p[0]);
  const dLat = (Math.max(...lats) - Math.min(...lats)) * 111.32;
  const lat0 = (Math.min(...lats) + Math.max(...lats)) / 2;
  const dLng = (Math.max(...lngs) - Math.min(...lngs)) * 111.32 * Math.cos((lat0 * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

async function lookup(osmId) {
  const url =
    "https://nominatim.openstreetmap.org/lookup?" +
    new URLSearchParams({
      osm_ids: osmId,
      format: "jsonv2",
      polygon_geojson: "1",
    });
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "es" },
  });
  if (!res.ok) throw new Error(`Nominatim lookup ${osmId} failed: ${res.status}`);
  const rows = await res.json();
  const geo = rows[0]?.geojson;
  if (!geo || (geo.type !== "Polygon" && geo.type !== "MultiPolygon")) {
    throw new Error(`No polygon for ${osmId}`);
  }
  if (geo.type === "Polygon" && !ringClosed(geo.coordinates[0])) {
    geo.coordinates[0].push(geo.coordinates[0][0]);
  }
  if (looksCircular(geo)) {
    throw new Error(`Geometry for ${osmId} looks circular; refusing to save.`);
  }
  return geo;
}

function collectCoords(geom, into) {
  if (!geom) return;
  const deep = (node) => {
    if (!Array.isArray(node)) return;
    if (typeof node[0] === "number" && node.length >= 2) into.push([node[0], node[1]]);
    else node.forEach(deep);
  };
  if (geom.type === "Polygon" || geom.type === "MultiPolygon") deep(geom.coordinates);
  else if (Array.isArray(geom)) deep(geom);
}

function cross(o, a, b) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function convexHull(points) {
  const key = (p) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
  const uniq = [];
  const seen = new Set();
  for (const p of points) {
    const k = key(p);
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(p);
  }
  uniq.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (uniq.length < 3) return uniq;
  const lower = [];
  for (const p of uniq) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = uniq.length - 1; i >= 0; i--) {
    const p = uniq[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function bufferPolygon(lat, lon, radiusM, steps = 48) {
  const ring = [];
  const latScale = 111320;
  const lonScale = 111320 * Math.cos((lat * Math.PI) / 180);
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const jitter = 1 + 0.045 * Math.sin(3 * t) + 0.03 * Math.cos(5 * t);
    const dx = Math.cos(t) * radiusM * jitter;
    const dy = Math.sin(t) * radiusM * jitter;
    ring.push([lon + dx / lonScale, lat + dy / latScale]);
  }
  ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
}

function overpassToGeom(elements, lat, lon, maxKm) {
  const pts = [];
  for (const el of elements) {
    if (el.type === "way" && Array.isArray(el.geometry)) {
      const coords = el.geometry.map((n) => [n.lon, n.lat]);
      const clat = coords.reduce((s, p) => s + p[1], 0) / coords.length;
      const clon = coords.reduce((s, p) => s + p[0], 0) / coords.length;
      const dLat = (clat - lat) * 111.32;
      const dLng = (clon - lon) * 111.32 * Math.cos((lat * Math.PI) / 180);
      if (Math.hypot(dLat, dLng) > maxKm) continue;
      pts.push(...coords);
    } else if (el.type === "relation" && Array.isArray(el.members)) {
      for (const mem of el.members) {
        if (!Array.isArray(mem.geometry)) continue;
        pts.push(...mem.geometry.map((n) => [n.lon, n.lat]));
      }
    }
  }
  const hull = convexHull(pts);
  if (hull.length < 6) return null;
  const ring = hull.map((p) => [p[0], p[1]]);
  ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
}

async function overpass(query) {
  let last = "";
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await Promise.race([
        fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Accept: "application/json",
            "User-Agent": UA,
          },
          body: "data=" + encodeURIComponent(query),
        }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`timeout ${endpoint}`)), 22000);
        }),
      ]);
      const text = await res.text();
      if (!res.ok) {
        last = `${endpoint} ${res.status}`;
        continue;
      }
      return JSON.parse(text);
    } catch (err) {
      last = err instanceof Error ? err.message : String(err);
    }
  }
  throw new Error(`Overpass failed: ${last}`);
}

async function urbanFromOsm(town) {
  const q = `
[out:json][timeout:25];
(
  way(around:${town.radiusM},${town.lat},${town.lon})["place"~"town|city"];
  rel(around:${town.radiusM},${town.lat},${town.lon})["place"~"town|city"];
  way(around:${town.radiusM},${town.lat},${town.lon})["landuse"~"residential|commercial|retail|industrial|construction"];
  rel(around:${town.radiusM},${town.lat},${town.lon})["landuse"~"residential|commercial|retail|industrial"];
);
out geom;
`;
  const data = await overpass(q);
  const placeWays = (data.elements || []).filter(
    (el) => el.type === "way" && el.tags?.place && /town|city/.test(el.tags.place),
  );
  if (placeWays.length) {
    const geom = overpassToGeom(placeWays, town.lat, town.lon, town.radiusM / 1000 + 1);
    if (geom && bboxSpanKm(geom) < 18) {
      return {
        geometry: geom,
        kind: "cabecera-urbana",
        source: `OSM place=town/city way(s) around ${town.name} cabecera (Overpass)`,
        osm: placeWays.map((w) => `W${w.id}`).join(","),
      };
    }
  }
  const land = (data.elements || []).filter(
    (el) => el.tags?.landuse && /residential|commercial|retail|industrial|construction/.test(el.tags.landuse),
  );
  const geom = overpassToGeom(land, town.lat, town.lon, town.radiusM / 1000 + 0.6);
  if (geom && bboxSpanKm(geom) >= 1.2 && bboxSpanKm(geom) < 16) {
    return {
      geometry: geom,
      kind: "cabecera-urbana",
      source: `OSM landuse=residential/commercial dissolve (convex hull) around ${town.name} cabecera`,
      osm: `overpass:around:${town.radiusM}@${town.lat},${town.lon}`,
    };
  }
  return {
    geometry: bufferPolygon(town.lat, town.lon, Math.min(2200, town.radiusM * 0.7), 48),
    kind: "cabecera-urbana",
    source: `Tight cabecera buffer (~2 km) around Nominatim town center for ${town.name}; OSM has no urban relation`,
    osm: `buffer:${town.lat},${town.lon}`,
  };
}

const existing = JSON.parse(await readFile(outFile, "utf8"));
const byName = new Map();

for (const city of FIXED) {
  console.log("Fetching", city.name, city.osm, city.source);
  const geometry = await lookup(city.osm);
  byName.set(city.name, {
    type: "Feature",
    properties: {
      name: city.name,
      kind: city.kind,
      source: city.source,
      osm: city.osm,
    },
    geometry,
  });
  await sleep(1100);
}

for (const town of URBAN_TOWNS) {
  console.log("Building urban outline", town.name);
  try {
    const urban = await urbanFromOsm(town);
    console.log(" ", urban.kind, urban.source, "spanKm", bboxSpanKm(urban.geometry).toFixed(2));
    byName.set(town.name, {
      type: "Feature",
      properties: {
        name: town.name,
        kind: urban.kind,
        source: urban.source,
        osm: urban.osm,
      },
      geometry: urban.geometry,
    });
  } catch (err) {
    console.warn(" Overpass failed, using cabecera buffer:", err.message);
    byName.set(town.name, {
      type: "Feature",
      properties: {
        name: town.name,
        kind: "cabecera-urbana",
        source: `Tight cabecera buffer around Nominatim town center for ${town.name} (Overpass unavailable)`,
        osm: `buffer:${town.lat},${town.lon}`,
      },
      geometry: bufferPolygon(town.lat, town.lon, 2200, 48),
    });
  }
  await sleep(1500);
}

const features = CITY_ORDER.map((name) => byName.get(name)).filter(Boolean);
if (features.length !== 7) throw new Error(`Expected 7 city features, got ${features.length}`);

const CITY_POLYS = [
  {
    key: "bogota",
    name: "Bogotá",
    osm: "R7426387",
    kind: "ciudad",
    source: "OSM relation Bogotá (R7426387) Distrito Capital urbano",
  },
  {
    key: "cali",
    name: "Cali",
    osm: "R8811628",
    kind: "ciudad",
    source: "OSM relation Cali ciudad (R8811628)",
  },
];

const cityCollections = {};
for (const city of CITY_POLYS) {
  console.log("Fetching", city.name, city.osm);
  const geometry = await lookup(city.osm);
  cityCollections[city.key] = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: city.name,
          kind: city.kind,
          source: city.source,
          osm: city.osm,
        },
        geometry,
      },
    ],
  };
  await sleep(1100);
}

const payload = {
  presencial: { type: "FeatureCollection", features },
  remoto: existing.remoto,
  bogota: cityCollections.bogota,
  cali: cityCollections.cali,
};

await writeFile(outFile, JSON.stringify(payload));
console.log("Wrote", outFile, "features", features.length, "+ bogota + cali");
