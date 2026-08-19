/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Pública a propósito (el SDK de Maps corre en el navegador).
   * Restringir en Google Cloud por HTTP referrer y por API. Sin ella se usa el iframe embebido.
   */
  readonly VITE_GOOGLE_MAPS_KEY?: string;
  /** Map ID de Google Cloud (Map Management). Solo se usa si está definido; si falla, el pin clásico no lo necesita. */
  readonly VITE_GOOGLE_MAPS_MAP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  google?: {
    maps: typeof google.maps;
  };
  gm_authFailure?: () => void;
  roseMapsReady?: () => void;
}

declare namespace google.maps {
  function importLibrary(name: "maps" | "marker" | string): Promise<unknown>;
  class Map {
    constructor(el: HTMLElement, opts?: Record<string, unknown>);
    data: Data;
    fitBounds(bounds: LatLngBounds, padding?: number): void;
    setOptions(opts: Record<string, unknown>): void;
  }
  namespace marker {
    class AdvancedMarkerElement {
      constructor(opts?: Record<string, unknown>);
    }
  }
  class LatLngBounds {
    extend(latLng: { lat: number; lng: number }): void;
  }
  class Marker {
    constructor(opts?: Record<string, unknown>);
  }
  class Size {
    constructor(width: number, height: number);
  }
  class Point {
    constructor(x: number, y: number);
  }
  class InfoWindow {
    constructor(opts?: Record<string, unknown>);
    open(opts: { map: Map }): void;
  }
  namespace event {
    function removeListener(listener: MapsEventListener): void;
    function trigger(instance: unknown, eventName: string): void;
    function addListenerOnce(
      instance: unknown,
      eventName: string,
      handler: () => void,
    ): MapsEventListener;
  }
  interface MapsEventListener {
    remove(): void;
  }
  interface MapTypeStyle {
    elementType?: string;
    featureType?: string;
    stylers?: Record<string, unknown>[];
  }
  class Data {
    addGeoJson(geoJson: unknown): unknown[];
    setStyle(
      style:
        | Record<string, unknown>
        | ((feature: Data.Feature) => Record<string, unknown>),
    ): void;
    forEach(callback: (feature: Data.Feature) => void): void;
    remove(feature: Data.Feature): void;
    addListener(eventName: string, handler: (e: Data.MouseEvent) => void): MapsEventListener;
  }
  namespace Data {
    interface Feature {
      getProperty(name: string): unknown;
    }
    interface MouseEvent {
      feature: Feature;
      latLng?: { lat(): number; lng(): number };
    }
  }
}

