import { useEffect, useRef, useState } from "react";
import coverage from "../data/coverage.json";
import { useI18n } from "../i18n/I18nProvider";
import { useTheme } from "../theme/ThemeProvider";
import { loadGoogleMaps, mapStylesFor, onMapsAuthFailure } from "../lib/loadGoogleMaps";
import type { SedeId } from "../content";

type Mode = "presencial" | "remoto";
type CoverageFC = {
  type: string;
  features: { geometry: { coordinates: unknown }; properties?: { name?: string } }[];
};

const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? "";

const FILL: Record<Mode | "city", string> = {
  presencial: "#e10600",
  remoto: "#c45a1a",
  city: "#e10600",
};

const META_CITIES = [
  "Villavicencio",
  "Acacías",
  "Restrepo",
  "Cumaral",
  "Granada",
  "San Martín",
  "Puerto López",
] as const;

const FALLBACK_Q: Record<SedeId, { presencial: string; remoto?: string }> = {
  villavicencio: {
    presencial: "Villavicencio, Acacías, Restrepo, Cumaral, Granada, San Martín, Puerto López, Meta, Colombia",
    remoto: "Departamento del Meta, Colombia",
  },
  bogota: { presencial: "Bogotá, Distrito Capital, Colombia" },
  cali: { presencial: "Cali, Valle del Cauca, Colombia" },
};

function collectBounds(fc: CoverageFC, onlyName?: string | null) {
  const bounds = new google.maps.LatLngBounds();
  let any = false;
  for (const feature of fc.features) {
    if (onlyName && feature.properties?.name !== onlyName) continue;
    const geom = feature.geometry;
    if (!geom) continue;
    const walk = (pos: number[]) => {
      if (pos.length >= 2 && typeof pos[0] === "number") {
        bounds.extend({ lng: pos[0], lat: pos[1] });
        any = true;
      }
    };
    const deep = (node: unknown) => {
      if (!Array.isArray(node)) return;
      if (typeof node[0] === "number") walk(node as number[]);
      else node.forEach(deep);
    };
    deep(geom.coordinates);
  }
  return any ? bounds : null;
}

function featureCollectionFor(sede: SedeId, mode: Mode): CoverageFC {
  if (sede === "bogota") return coverage.bogota as CoverageFC;
  if (sede === "cali") return coverage.cali as CoverageFC;
  return (mode === "presencial" ? coverage.presencial : coverage.remoto) as CoverageFC;
}

type Props = {
  sede: SedeId;
};

export default function CoverageMap({ sede }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const { theme } = useTheme();
  const { m, locale } = useI18n();
  const [mode, setMode] = useState<Mode>("presencial");
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "nokey">("loading");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [mapGen, setMapGen] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const showModeToggle = sede === "villavicencio";
  const activeMode: Mode = showModeToggle ? mode : "presencial";
  const fillKey: Mode | "city" = showModeToggle ? activeMode : "city";

  useEffect(() => {
    setSelected(null);
    if (sede !== "villavicencio") setMode("presencial");
  }, [sede]);

  useEffect(() => {
    if (!mapsKey) {
      setStatus("nokey");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    setError("");
    const unauth = onMapsAuthFailure(() => {
      if (cancelled) return;
      mapRef.current = null;
      setError(m.coverage.errorHint);
      setStatus("error");
    });

    loadGoogleMaps(mapsKey, locale.split("-")[0])
      .then(() => {
        if (cancelled || !host.current) return;
        host.current.innerHTML = "";
        const map = new google.maps.Map(host.current, {
          center: { lat: 3.9, lng: -73.2 },
          zoom: 8,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: mapStylesFor(theme),
          gestureHandling: "cooperative",
          backgroundColor: theme === "light" ? "#f4efe8" : "#151010",
        });
        mapRef.current = map;
        google.maps.event.addListenerOnce(map, "idle", () => {
          google.maps.event.trigger(map, "resize");
        });
        setMapGen((n) => n + 1);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        mapRef.current = null;
        setError(err instanceof Error ? err.message : m.coverage.errorTitle);
        setStatus("error");
      });

    return () => {
      cancelled = true;
      unauth();
      mapRef.current = null;
      if (host.current) host.current.innerHTML = "";
    };
  }, [retry, mapsKey, locale, m.coverage.errorHint, m.coverage.errorTitle]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    map.setOptions({
      styles: mapStylesFor(theme),
      backgroundColor: theme === "light" ? "#f4efe8" : "#151010",
    });
  }, [theme, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    map.data.forEach((f) => map.data.remove(f));
    const fc = featureCollectionFor(sede, activeMode);
    map.data.addGeoJson(fc);
    if (!selected) {
      const bounds = collectBounds(fc);
      if (bounds) map.fitBounds(bounds, 48);
    }

    const listener = map.data.addListener("click", (e: google.maps.Data.MouseEvent) => {
      const name = String(e.feature.getProperty("name") ?? "");
      if (!name) return;
      setSelected((prev) => (prev === name ? null : name));
    });
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [sede, activeMode, status, mapGen, theme]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    map.data.setStyle((feature: google.maps.Data.Feature) => {
      const name = String(feature.getProperty("name") ?? "");
      const on = Boolean(selected && name === selected);
      return {
        fillColor: on ? "#ff1a12" : FILL[fillKey],
        fillOpacity: on ? 0.55 : 0.34,
        strokeColor: on ? "#ffffff" : "#ffd4cf",
        strokeWeight: on ? 3 : 2,
        clickable: true,
        zIndex: on ? 3 : 1,
      };
    });
    const fc = featureCollectionFor(sede, activeMode);
    const bounds = collectBounds(fc, selected);
    if (bounds) map.fitBounds(bounds, selected ? 72 : 48);
  }, [sede, activeMode, status, selected, fillKey]);

  const fallback =
    activeMode === "remoto" && FALLBACK_Q[sede].remoto
      ? FALLBACK_Q[sede].remoto!
      : FALLBACK_Q[sede].presencial;
  const fallbackZoom = activeMode === "remoto" ? 7 : sede === "villavicencio" ? 9 : 11;
  const fallbackSrc = mapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(fallback)}&language=${locale.split("-")[0]}&zoom=${fallbackZoom}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(fallback)}&hl=${locale.split("-")[0]}&z=${fallbackZoom}&output=embed`;

  const hint =
    sede === "villavicencio"
      ? activeMode === "presencial"
        ? m.coverage.hintOnsite
        : m.coverage.hintRemote
      : sede === "bogota"
        ? m.coverage.hintBogota
        : m.coverage.hintCali;

  const iframeTitle =
    activeMode === "remoto" ? m.coverage.iframeRemote : m.coverage.iframeOnsite;

  return (
    <div className="coverage-map">
      <div className="coverage-toolbar-band">
        {showModeToggle ? (
          <div className="coverage-toolbar coverage-toolbar-mode" role="tablist" aria-label={m.a11y.coverageType}>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "presencial"}
              className={mode === "presencial" ? "active" : undefined}
              onClick={() => {
                setSelected(null);
                setMode("presencial");
              }}
            >
              {m.coverage.presencial}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "remoto"}
              className={mode === "remoto" ? "active" : undefined}
              onClick={() => {
                setSelected(null);
                setMode("remoto");
              }}
            >
              {m.coverage.remoto}
            </button>
          </div>
        ) : (
          <p className="coverage-mode-label">{m.coverage.presencialCity}</p>
        )}
      </div>

      <p className="coverage-hint">{hint}</p>
      {status === "error" || status === "nokey" ? (
        <div className="map-shell">
          {status === "error" ? (
            <div className="map-error" role="alert">
              <strong>{m.coverage.errorTitle}</strong>
              <p>{error || m.coverage.errorHint}</p>
              <button type="button" className="btn btn-ghost" onClick={() => setRetry((n) => n + 1)}>
                {m.coverage.retry}
              </button>
            </div>
          ) : null}
          <iframe
            className="coverage-canvas"
            title={iframeTitle}
            src={fallbackSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="map-shell">
          {status === "loading" ? <p className="map-loading">{m.coverage.loading}</p> : null}
          <div className="coverage-canvas" ref={host} role="img" aria-label={m.a11y.coverageMap} />
        </div>
      )}
      {sede === "villavicencio" && activeMode === "presencial" ? (
        <ul className="coverage-legend coverage-legend-cities">
          {META_CITIES.map((city) => (
            <li key={city}>
              <button
                type="button"
                className={selected === city ? "is-on" : undefined}
                aria-pressed={selected === city}
                onClick={() => setSelected((prev) => (prev === city ? null : city))}
              >
                <i className="swatch onsite" />
                {city}
              </button>
            </li>
          ))}
        </ul>
      ) : sede === "villavicencio" && activeMode === "remoto" ? (
        <ul className="coverage-legend">
          <li>
            <i className="swatch remote" />
            {m.coverage.legendRemote}
          </li>
        </ul>
      ) : (
        <ul className="coverage-legend">
          <li>
            <i className="swatch onsite" />
            {sede === "bogota" ? m.coverage.legendBogota : m.coverage.legendCali}
          </li>
        </ul>
      )}
    </div>
  );
}
