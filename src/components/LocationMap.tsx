import { useEffect, useRef, useState } from "react";
import { COMPANY, SEDES, SEDE_ORDER, type SedeId } from "../content";
import { useI18n } from "../i18n/I18nProvider";
import { useTheme } from "../theme/ThemeProvider";
import {
  assetUrl,
  loadGoogleMaps,
  loadMarkerLibrary,
  mapStylesFor,
  onMapsAuthFailure,
} from "../lib/loadGoogleMaps";

const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? "";
const customMapId = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ?? "").trim();

function placePin(
  map: google.maps.Map,
  position: { lat: number; lng: number },
  title: string,
  useAdvanced: boolean,
): google.maps.Marker | google.maps.marker.AdvancedMarkerElement {
  const iconUrl = assetUrl("brand/logo-mark-red.png");
  if (useAdvanced && google.maps.marker?.AdvancedMarkerElement) {
    const glyph = document.createElement("img");
    glyph.src = iconUrl;
    glyph.alt = title;
    glyph.width = 48;
    glyph.height = 58;
    glyph.style.display = "block";
    return new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      title,
      content: glyph,
    });
  }
  return new google.maps.Marker({
    map,
    position,
    title,
    icon: {
      url: iconUrl,
      scaledSize: new google.maps.Size(40, 48),
      anchor: new google.maps.Point(20, 48),
    },
  });
}

function sedeLabel(m: ReturnType<typeof useI18n>["m"], id: SedeId): string {
  if (id === "bogota") return m.coverage.sedeBogota;
  if (id === "cali") return m.coverage.sedeCali;
  return m.coverage.sedeVillavicencio;
}

export default function LocationMap() {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | google.maps.marker.AdvancedMarkerElement | null>(null);
  const advancedRef = useRef(false);
  const themeRef = useRef<"light" | "dark">("dark");
  const sedeRef = useRef<SedeId>("villavicencio");
  const { theme } = useTheme();
  const { m, interpolate, locale } = useI18n();
  const [sede, setSede] = useState<SedeId>("villavicencio");
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "nokey">(
    mapsKey ? "loading" : "nokey",
  );
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  themeRef.current = theme;
  sedeRef.current = sede;

  const place = SEDES[sede];
  const iframeSrc = mapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(place.mapsQuery)}&zoom=16&language=${locale.split("-")[0]}`
    : place.mapsEmbed;
  const title = interpolate(m.map.iframeTitle, { name: COMPANY.tradeName, address: place.address });
  const aria = interpolate(m.map.aria, { name: COMPANY.tradeName, address: place.address });

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
      markerRef.current = null;
      setError(m.map.errorHint);
      setStatus("error");
    });

    // Language is fixed on first Maps script load; do not remount when locale changes.
    loadGoogleMaps(mapsKey, locale.split("-")[0])
      .then(async () => {
        if (cancelled || !host.current) return;
        host.current.innerHTML = "";

        const startId = sedeRef.current;
        const start = SEDES[startId];
        const mapTheme = themeRef.current;
        const baseOpts = {
          center: { lat: start.lat, lng: start.lng },
          zoom: 16,
          minZoom: 10,
          maxZoom: 20,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: "greedy",
          backgroundColor: mapTheme === "light" ? "#f4efe8" : "#151010",
        };

        let map: google.maps.Map;
        let advanced = false;

        if (customMapId) {
          try {
            await loadMarkerLibrary();
            map = new google.maps.Map(host.current, { ...baseOpts, mapId: customMapId });
            advanced = true;
          } catch {
            map = new google.maps.Map(host.current, {
              ...baseOpts,
              styles: mapStylesFor(mapTheme),
            });
          }
        } else {
          map = new google.maps.Map(host.current, {
            ...baseOpts,
            styles: mapStylesFor(mapTheme),
          });
        }

        if (cancelled) return;
        mapRef.current = map;
        advancedRef.current = advanced;
        try {
          markerRef.current = placePin(
            map,
            { lat: start.lat, lng: start.lng },
            `${COMPANY.tradeName} — ${start.address}`,
            advanced,
          );
        } catch {
          advancedRef.current = false;
          markerRef.current = placePin(
            map,
            { lat: start.lat, lng: start.lng },
            `${COMPANY.tradeName} — ${start.address}`,
            false,
          );
        }
        google.maps.event.addListenerOnce(map, "idle", () => {
          google.maps.event.trigger(map, "resize");
          // Keep the currently selected sede — never force Villavicencio after idle.
          const current = SEDES[sedeRef.current];
          map.setOptions({ center: { lat: current.lat, lng: current.lng } });
        });
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        mapRef.current = null;
        markerRef.current = null;
        setError(err instanceof Error ? err.message : m.map.errorTitle);
        setStatus("error");
      });

    return () => {
      cancelled = true;
      unauth();
      mapRef.current = null;
      markerRef.current = null;
      if (host.current) host.current.innerHTML = "";
    };
    // Intentionally omit locale / translated strings: remounting resets the pin to default sede.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map instance must outlive locale changes
  }, [retry, mapsKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    if (customMapId) return;
    map.setOptions({
      styles: mapStylesFor(theme),
      backgroundColor: theme === "light" ? "#f4efe8" : "#151010",
    });
  }, [theme, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    const next = SEDES[sede];
    const pos = { lat: next.lat, lng: next.lng };
    const pinTitle = `${COMPANY.tradeName} — ${next.address}`;

    const prev = markerRef.current;
    if (prev) {
      if (prev instanceof google.maps.Marker) {
        prev.setMap(null);
      } else {
        (prev as google.maps.marker.AdvancedMarkerElement).map = null;
      }
      markerRef.current = null;
    }

    try {
      markerRef.current = placePin(map, pos, pinTitle, advancedRef.current);
    } catch {
      markerRef.current = placePin(map, pos, pinTitle, false);
    }
    map.setCenter(pos);
    map.setOptions({ zoom: 16 });
  }, [sede, status]);

  const mapBody =
    status === "error" || status === "nokey" ? (
      <div className="map-shell">
        {status === "error" ? (
          <div className="map-error" role="alert">
            <strong>{m.map.errorTitle}</strong>
            <p>{error || m.map.errorHint}</p>
            <button type="button" className="btn btn-ghost" onClick={() => setRetry((n) => n + 1)}>
              {m.coverage.retry}
            </button>
          </div>
        ) : null}
        <iframe
          className="map-frame"
          title={title}
          src={iframeSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    ) : (
      <div className="map-shell">
        {status === "loading" ? <p className="map-loading">{m.map.loading}</p> : null}
        <div className="map-frame" ref={host} role="img" aria-label={aria} />
      </div>
    );

  return (
    <div className="location-map">
      <div className="coverage-toolbar" role="tablist" aria-label={m.a11y.locationSede}>
        {SEDE_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={sede === id}
            className={sede === id ? "active" : undefined}
            onClick={() => setSede(id)}
          >
            {sedeLabel(m, id)}
          </button>
        ))}
      </div>
      <p className="location-address">
        <strong>{sedeLabel(m, sede)}</strong>
        <span>{place.address}</span>
        <small>{place.locationLabel}</small>
      </p>
      {mapBody}
    </div>
  );
}
