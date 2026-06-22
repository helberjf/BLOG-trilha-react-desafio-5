import type { CompanyPlan, CompanySubscriptionStatus } from "@/lib/billing/plans";
import { distanceInKm, type Coordinates } from "@/lib/delivery/location";

export type DeliverySort = "recentes" | "distancia" | "avaliacoes" | "valor" | "tempo";
export type DeliveryRequestStatus = "OPEN" | "TAKEN" | "DONE" | "CANCELLED";

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
  companyPlan?: CompanyPlan | null;
  subscriptionStatus?: CompanySubscriptionStatus | null;
  isSponsored?: boolean;
  pickupDistanceKm?: number;
  rating: number;
  status?: DeliveryRequestStatus;
  acceptedAt?: string | null;
  acceptedBy?: {
    id: string;
    name: string | null;
    whatsapp?: string | null;
  } | null;
  review?: {
    id: string;
    rating: number;
    comment?: string | null;
  } | null;
  createdAt: string;
};

export const deliverySortOptions = [
  { value: "recentes", label: "Mais recentes" },
  { value: "distancia", label: "Distancia" },
  { value: "valor", label: "Maior valor" },
  { value: "tempo", label: "Menor tempo" }
] as const;

export const DELIVERY_PAGE_SIZE = 10;
export const DELIVERY_REQUEST_VISIBLE_HOURS = 24;

const fallbackReferenceTime = Date.now();

function fallbackIsoHoursAgo(hours: number) {
  return new Date(fallbackReferenceTime - hours * 60 * 60 * 1000).toISOString();
}

function fallbackDateDaysFromNow(days: number) {
  return new Date(fallbackReferenceTime + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export const fallbackDeliveryRequests: DeliveryRequestSummary[] = [
  {
    id: "seed-1",
    title: "Entrega expressa de marmitas",
    city: "Sao Paulo",
    pickupAddress: "Rua Vergueiro, 1200 - Paraiso",
    pickupCoordinates: { latitude: -23.5729, longitude: -46.6424 },
    dropoffAddress: "Av. Paulista, 900 - Bela Vista",
    dropoffCoordinates: { latitude: -23.5651, longitude: -46.6516 },
    scheduledDate: fallbackDateDaysFromNow(1),
    scheduledTime: "11:30",
    deliveryValueCents: 2800,
    estimatedMinutes: 35,
    description: "Retirar 6 marmitas embaladas e entregar direto na recepcao.",
    posterWhatsapp: "11988887777",
    posterName: "Restaurante Central",
    companyPlan: "PATROCINADO",
    subscriptionStatus: "ACTIVE",
    isSponsored: true,
    rating: 4.8,
    status: "OPEN",
    createdAt: fallbackIsoHoursAgo(1)
  },
  {
    id: "seed-2",
    title: "Documento urgente no centro",
    city: "Sao Paulo",
    pickupAddress: "Rua Augusta, 500 - Consolacao",
    pickupCoordinates: { latitude: -23.5371, longitude: -46.6426 },
    dropoffAddress: "Praca da Se, 10 - Centro",
    dropoffCoordinates: { latitude: -23.5506, longitude: -46.6339 },
    scheduledDate: fallbackDateDaysFromNow(1),
    scheduledTime: "15:00",
    deliveryValueCents: 4200,
    estimatedMinutes: 50,
    description: "Envelope pequeno. Precisa de comprovante de entrega.",
    posterWhatsapp: "11999998888",
    posterName: "Contabilidade Alves",
    companyPlan: "EMPRESA",
    subscriptionStatus: "TRIALING",
    isSponsored: false,
    rating: 4.6,
    status: "OPEN",
    createdAt: fallbackIsoHoursAgo(2)
  },
  {
    id: "seed-3",
    title: "Coleta de peca automotiva",
    city: "Campinas",
    pickupAddress: "Av. Andrade Neves, 740 - Centro",
    pickupCoordinates: { latitude: -22.9036, longitude: -47.0616 },
    dropoffAddress: "Rua Barreto Leme, 1020 - Cambui",
    dropoffCoordinates: { latitude: -22.8994, longitude: -47.0527 },
    scheduledDate: fallbackDateDaysFromNow(1),
    scheduledTime: "09:20",
    deliveryValueCents: 3500,
    estimatedMinutes: 40,
    description: "Peca pequena ja embalada no balcao de retirada.",
    posterWhatsapp: "19988887777",
    posterName: "Auto Pecas Cambui",
    companyPlan: "EMPRESA",
    subscriptionStatus: "ACTIVE",
    isSponsored: false,
    rating: 4.7,
    status: "OPEN",
    createdAt: fallbackIsoHoursAgo(3)
  }
];

export function getDeliveryRequestVisibilityCutoff(now = new Date()) {
  return new Date(now.getTime() - DELIVERY_REQUEST_VISIBLE_HOURS * 60 * 60 * 1000);
}

export function filterVisibleDeliveryRequests(
  requests: DeliveryRequestSummary[],
  now = new Date()
) {
  const cutoff = getDeliveryRequestVisibilityCutoff(now).getTime();

  return requests.filter(request => {
    const createdAt = new Date(request.createdAt).getTime();
    const isOpen = request.status === undefined || request.status === "OPEN";
    return isOpen && Number.isFinite(createdAt) && createdAt >= cutoff;
  });
}

export function normalizeSort(value: string | string[] | undefined): DeliverySort {
  const raw = Array.isArray(value) ? value[0] : value;
  return deliverySortOptions.some(option => option.value === raw) ? (raw as DeliverySort) : "recentes";
}

export function sortDeliveryRequests(
  requests: DeliveryRequestSummary[],
  sort: DeliverySort
) {
  return [...requests].sort((a, b) => {
    const sponsoredDiff = Number(Boolean(b.isSponsored)) - Number(Boolean(a.isSponsored));
    if (sponsoredDiff !== 0) return sponsoredDiff;
    if (sort === "valor") return b.deliveryValueCents - a.deliveryValueCents;
    if (sort === "tempo") return a.estimatedMinutes - b.estimatedMinutes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export type DeliveryRequestSearch = {
  city?: string;
  coordinates?: Coordinates;
  now?: Date;
  radiusKm?: number;
  requests: DeliveryRequestSummary[];
  sort: DeliverySort;
};

export function searchDeliveryRequests({
  city,
  coordinates,
  now,
  radiusKm,
  requests,
  sort
}: DeliveryRequestSearch) {
  const normalizedCity = city?.trim().toLowerCase();
  const hasRadiusSearch = Boolean(coordinates && radiusKm && radiusKm > 0);
  const visibleRequests = filterVisibleDeliveryRequests(requests, now);
  const requestsWithDistance = coordinates
    ? visibleRequests.map(request => {
        const distanceKm = request.pickupCoordinates
          ? distanceInKm(coordinates, request.pickupCoordinates)
          : null;

        return {
          request:
            distanceKm === null
              ? request
              : {
                  ...request,
                  pickupDistanceKm: Number(distanceKm.toFixed(1))
                },
          distanceKm
        };
      })
    : visibleRequests.map(request => ({ request, distanceKm: null }));

  const filteredRequests = hasRadiusSearch
    ? requestsWithDistance
        .filter(item => item.distanceKm !== null && radiusKm !== undefined && item.distanceKm <= radiusKm)
        .map(item => item.request)
    : normalizedCity
      ? requestsWithDistance
          .map(item => item.request)
          .filter(request => request.city.toLowerCase() === normalizedCity)
      : requestsWithDistance.map(item => item.request);

  if (sort === "distancia" && coordinates) {
    return [...filteredRequests].sort(
      (left, right) =>
        (left.pickupDistanceKm ?? Number.POSITIVE_INFINITY) -
        (right.pickupDistanceKm ?? Number.POSITIVE_INFINITY)
    );
  }

  return sortDeliveryRequests(filteredRequests, sort);
}
