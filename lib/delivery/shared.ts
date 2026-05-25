import type { Coordinates } from "@/lib/delivery/location";

export type DeliverySort = "recentes" | "avaliacoes" | "valor" | "tempo";

export type DeliveryRequestSummary = {
  id: string;
  title: string;
  city: string;
  pickupAddress: string;
  pickupCoordinates?: Coordinates;
  dropoffAddress: string;
  dropoffCoordinates?: Coordinates;
  scheduledDate: string;
  scheduledTime: string;
  deliveryValueCents: number;
  estimatedMinutes: number;
  description: string;
  posterWhatsapp: string;
  posterName: string;
  rating: number;
  createdAt: string;
};

export const deliverySortOptions = [
  { value: "recentes", label: "Mais recentes" },
  { value: "distancia", label: "Distancia" },
  { value: "valor", label: "Maior valor" },
  { value: "tempo", label: "Menor tempo" },
  { value: "avaliacoes", label: "Melhores avaliacoes" }
] as const;

export const DELIVERY_PAGE_SIZE = 10;

export const fallbackDeliveryRequests: DeliveryRequestSummary[] = [
  {
    id: "seed-1",
    title: "Entrega expressa de marmitas",
    city: "Sao Paulo",
    pickupAddress: "Rua Vergueiro, 1200 - Paraiso",
    pickupCoordinates: { latitude: -23.5729, longitude: -46.6424 },
    dropoffAddress: "Av. Paulista, 900 - Bela Vista",
    dropoffCoordinates: { latitude: -23.5651, longitude: -46.6516 },
    scheduledDate: "2026-05-24",
    scheduledTime: "11:30",
    deliveryValueCents: 2800,
    estimatedMinutes: 35,
    description: "Retirar 6 marmitas embaladas e entregar direto na recepcao.",
    posterWhatsapp: "11988887777",
    posterName: "Restaurante Central",
    rating: 4.8,
    createdAt: "2026-05-23T13:00:00.000Z"
  },
  {
    id: "seed-2",
    title: "Documento urgente no centro",
    city: "Sao Paulo",
    pickupAddress: "Rua Augusta, 500 - Consolacao",
    pickupCoordinates: { latitude: -23.5371, longitude: -46.6426 },
    dropoffAddress: "Praca da Se, 10 - Centro",
    dropoffCoordinates: { latitude: -23.5506, longitude: -46.6339 },
    scheduledDate: "2026-05-24",
    scheduledTime: "15:00",
    deliveryValueCents: 4200,
    estimatedMinutes: 50,
    description: "Envelope pequeno. Precisa de comprovante de entrega.",
    posterWhatsapp: "11999998888",
    posterName: "Contabilidade Alves",
    rating: 4.6,
    createdAt: "2026-05-23T12:10:00.000Z"
  },
  {
    id: "seed-3",
    title: "Coleta de peca automotiva",
    city: "Campinas",
    pickupAddress: "Av. Andrade Neves, 740 - Centro",
    pickupCoordinates: { latitude: -22.9036, longitude: -47.0616 },
    dropoffAddress: "Rua Barreto Leme, 1020 - Cambui",
    dropoffCoordinates: { latitude: -22.8994, longitude: -47.0527 },
    scheduledDate: "2026-05-24",
    scheduledTime: "09:20",
    deliveryValueCents: 3500,
    estimatedMinutes: 40,
    description: "Peca pequena ja embalada no balcao de retirada.",
    posterWhatsapp: "19988887777",
    posterName: "Auto Pecas Cambui",
    rating: 4.7,
    createdAt: "2026-05-23T11:20:00.000Z"
  }
];

export function normalizeSort(value: string | string[] | undefined): DeliverySort {
  const raw = Array.isArray(value) ? value[0] : value;
  return deliverySortOptions.some(option => option.value === raw) ? (raw as DeliverySort) : "recentes";
}

export function sortDeliveryRequests(
  requests: DeliveryRequestSummary[],
  sort: DeliverySort
) {
  return [...requests].sort((a, b) => {
    if (sort === "avaliacoes") return b.rating - a.rating;
    if (sort === "valor") return b.deliveryValueCents - a.deliveryValueCents;
    if (sort === "tempo") return a.estimatedMinutes - b.estimatedMinutes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
