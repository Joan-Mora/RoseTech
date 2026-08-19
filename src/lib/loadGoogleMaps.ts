let pending: Promise<void> | null = null;
let loadedLanguage: string | null = null;

const AUTH_EVENT = "rose-maps-auth-failure";

function bindAuthFailure(): void {
  const prev = window.gm_authFailure;
  window.gm_authFailure = () => {
    try {
      prev?.();
    } catch {
      /* ignore previous handler errors */
    }
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
  };
}

export function onMapsAuthFailure(handler: () => void): () => void {
  const listener = () => handler();
  window.addEventListener(AUTH_EVENT, listener);
  return () => window.removeEventListener(AUTH_EVENT, listener);
}

/**
 * Loads Maps JavaScript API once. Uses `loading=async` without a URL
 * `libraries=` list — libraries load via importLibrary so the canvas stays intact.
 * Language is applied on first load only.
 */
export function loadGoogleMaps(apiKey: string, language = "es"): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps && typeof window.google.maps.importLibrary === "function") {
    return google.maps.importLibrary("maps").then(() => undefined);
  }
  if (pending) return pending;

  loadedLanguage = language;
  bindAuthFailure();

  pending = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-rose-maps]");
    if (existing) {
      existing.addEventListener("load", () => {
        if (!window.google?.maps?.importLibrary) {
          pending = null;
          reject(new Error("Google Maps loaded without importLibrary."));
          return;
        }
        google.maps
          .importLibrary("maps")
          .then(() => resolve())
          .catch((err) => {
            pending = null;
            reject(err);
          });
      });
      existing.addEventListener("error", () => {
        pending = null;
        reject(new Error("No se pudo cargar Google Maps."));
      });
      return;
    }

    const script = document.createElement("script");
    const query = new URLSearchParams({
      key: apiKey,
      v: "weekly",
      language,
      region: "CO",
      loading: "async",
      callback: "roseMapsReady",
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${query}`;
    script.async = true;
    script.dataset.roseMaps = "1";

    window.roseMapsReady = () => {
      delete window.roseMapsReady;
      if (!window.google?.maps?.importLibrary) {
        pending = null;
        reject(new Error("Google Maps no expuso importLibrary."));
        return;
      }
      google.maps
        .importLibrary("maps")
        .then(() => resolve())
        .catch((err) => {
          pending = null;
          reject(err);
        });
    };

    script.onerror = () => {
      delete window.roseMapsReady;
      pending = null;
      reject(new Error("No se pudo cargar el script de Google Maps."));
    };
    document.head.appendChild(script);
  });

  return pending;
}

export function mapsLanguage(): string | null {
  return loadedLanguage;
}

export async function loadMarkerLibrary(): Promise<void> {
  await google.maps.importLibrary("marker");
}

export const MAP_DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1c1414" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1c1414" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#c9b8b6" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#6b3030" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2222" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9d8b88" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1a24" }] },
];

export const MAP_LIGHT_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f4efe8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f4efe8" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#3a322e" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c4b2aa" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e2d6cc" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6a5e58" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d6df" }] },
];

export function mapStylesFor(theme: "light" | "dark"): google.maps.MapTypeStyle[] {
  return theme === "light" ? MAP_LIGHT_STYLE : MAP_DARK_STYLE;
}

export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "./";
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${normalized}${path.replace(/^\//, "")}`;
}
