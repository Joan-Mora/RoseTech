import { useEffect, useRef, useState } from "react";
import { COMPANY } from "../content";
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

/** Cra. 39 #10-51, La Esperanza, Villavicencio. */
export const HQ = { lat: 4.1284, lng: -73.63188 };

function placePin(
  map: google.maps.Map,
  title: string,
  useAdvanced: boolean,
): void {
  const iconUrl = assetUrl("brand/logo-mark-red.png");
  if (useAdvanced && google.maps.marker?.AdvancedMarkerElement) {
    const glyph = document.createElement("img");
    glyph.src = iconUrl;
    glyph.alt = title;
    glyph.width = 48;
    glyph.height = 58;
    glyph.style.display = "block";
    new google.maps.marker.AdvancedMarkerElement({
      map,
      position: HQ,
      title,
      content: glyph,
    });
    return;
  }
  new google.maps.Marker({
    map,
    position: HQ,
    title,
    icon: {
      url: iconUrl,
      scaledSize: new google.maps.Size(40, 48),
      anchor: new google.maps.Point(20, 48),
    },
  });
}

export default function LocationMap() {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const { theme } = useTheme();
  const { m, interpolate, locale } = useI18n();
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "nokey">(
    mapsKey ? "loading" : "nokey",
  );
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const iframeSrc = mapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(COMPANY.mapsQuery)}&zoom=16&language=${locale.split("-")[0]}`
    : COMPANY.mapsEmbed;
  const title = interpolate(m.map.iframeTitle, { name: COMPANY.tradeName, address: COMPANY.address });
  const aria = interpolate(m.map.aria, { name: COMPANY.tradeName, address: COMPANY.address });

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
      setError(m.map.errorHint);
      setStatus("error");
    });

    loadGoogleMaps(mapsKey, locale.split("-")[0])
      .then(async () => {
        if (cancelled || !host.current) return;
        host.current.innerHTML = "";

        const baseOpts = {
          center: HQ,
          zoom: 16,
          minZoom: 12,
          maxZoom: 20,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: "greedy",
          backgroundColor: theme === "light" ? "#f4efe8" : "#151010",
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
              styles: mapStylesFor(theme),
            });
          }
        } else {
          map = new google.maps.Map(host.current, {
            ...baseOpts,
            styles: mapStylesFor(theme),
          });
        }

        if (cancelled) return;
        mapRef.current = map;
        try {
          placePin(map, `${COMPANY.tradeName} — ${COMPANY.address}`, advanced);
        } catch {
          placePin(map, `${COMPANY.tradeName} — ${COMPANY.address}`, false);
        }
        google.maps.event.addListenerOnce(map, "idle", () => {
          google.maps.event.trigger(map, "resize");
          map.setOptions({ center: HQ });
        });
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        mapRef.current = null;
        setError(err instanceof Error ? err.message : m.map.errorTitle);
        setStatus("error");
      });

    return () => {
      cancelled = true;
      unauth();
      mapRef.current = null;
      if (host.current) host.current.innerHTML = "";
    };
  }, [retry, mapsKey, locale, m.map.errorHint, m.map.errorTitle]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    if (customMapId) return;
    map.setOptions({
      styles: mapStylesFor(theme),
      backgroundColor: theme === "light" ? "#f4efe8" : "#151010",
    });
  }, [theme, status]);

  if (status === "error" || status === "nokey") {
    return (
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
    );
  }

  return (
    <div className="map-shell">
      {status === "loading" ? <p className="map-loading">{m.map.loading}</p> : null}
      <div className="map-frame" ref={host} role="img" aria-label={aria} />
    </div>
  );
}
