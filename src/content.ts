/** Workshop photos in public/images (Unsplash / Pexels, compressed). */
export const SERVICE_DEVICE_PHOTOS = [
  "./images/svc-towers.jpg",
  "./images/svc-laptops.jpg",
  "./images/svc-printers.jpg",
  "./images/svc-phones.jpg",
] as const;

export type SedeId = "villavicencio" | "bogota" | "cali";

export const SEDES = {
  villavicencio: {
    id: "villavicencio" as const,
    address: "Cra. 39 #10 51, Esperanza, Villavicencio, Meta",
    locationLabel: "Villavicencio, Meta, Colombia",
    city: "Villavicencio",
    region: "Meta",
    lat: 4.1284,
    lng: -73.63188,
    mapsQuery: "Rose Technology, Cra. 39 #10 51, Esperanza, Villavicencio, Meta",
    mapsEmbed:
      "https://maps.google.com/maps?q=Rose+Technology,+Cra.+39+%2310+51,+Esperanza,+Villavicencio,+Meta&hl=es&z=16&output=embed",
  },
  bogota: {
    id: "bogota" as const,
    address: "Cra. 120 # 17F-63, Fontibón, Bogotá, D.C.",
    locationLabel: "Bogotá, D.C., Colombia",
    city: "Bogotá",
    region: "Bogotá, D.C.",
    lat: 4.6876,
    lng: -74.1564,
    mapsQuery: "Cra. 120 #17F-63, Fontibón, Bogotá, Colombia",
    mapsEmbed:
      "https://maps.google.com/maps?q=Carrera+120+%2317F-63,+Fontib%C3%B3n,+Bogot%C3%A1&hl=es&z=16&output=embed",
  },
  cali: {
    id: "cali" as const,
    address: "Cra. 5 #7 32, COMUNA 3, Cali, Valle del Cauca",
    locationLabel: "Cali, Valle del Cauca, Colombia",
    city: "Cali",
    region: "Valle del Cauca",
    lat: 3.4506761,
    lng: -76.5338735,
    mapsQuery: "Carrera 5 #7-32, Comuna 3, Cali, Valle del Cauca, Colombia",
    mapsEmbed:
      "https://maps.google.com/maps?q=Carrera+5+%237-32,+Comuna+3,+Cali,+Colombia&hl=es&z=16&output=embed",
  },
} as const;

export const SEDE_ORDER: SedeId[] = ["villavicencio", "bogota", "cali"];

export const COMPANY = {
  shortName: "ROSE",
  legalName: "ROSE",
  tradeName: "ROSE Technology",
  acronym:
    "Centro de Reparación y Optimización de Sistemas Empresariales",
  tagline: "Innovación, seguridad y calidad",
  closer: "Tecnología que impulsa su negocio.",
  city: SEDES.villavicencio.city,
  department: SEDES.villavicencio.region,
  country: "Colombia",
  locationLabel: SEDES.villavicencio.locationLabel,
  address: SEDES.villavicencio.address,
  phoneDisplay: "300 250 7696",
  phoneE164: "573002507696",
  email: "serviciotechrose@gmail.com",
  myshopUrl: "https://myshop-service-admin.page.gd",
  myshopHost: "myshop-service-admin.page.gd",
  brochure: "/catalogo-rose-technology.pdf",
  mapsQuery: SEDES.villavicencio.mapsQuery,
  mapsEmbed: SEDES.villavicencio.mapsEmbed,
} as const;
