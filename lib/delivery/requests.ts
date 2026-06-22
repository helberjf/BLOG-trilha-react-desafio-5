import { cache } from "react";

import {
  type DeliveryRequestStatus,
  type DeliveryRequestSummary,
  type DeliverySort,
  fallbackDeliveryRequests,
  getDeliveryRequestVisibilityCutoff,
  searchDeliveryRequests
} from "@/lib/delivery/shared";
import { isSponsoredCompanyPlan, isSubscriptionActiveForPublishing } from "@/lib/billing/plans";
import type { CompanyPlan, CompanySubscriptionStatus } from "@/lib/billing/plans";
import type { Coordinates } from "@/lib/delivery/location";

export {
  type DeliveryRequestSummary,
  type DeliverySort,
  deliverySortOptions,
  fallbackDeliveryRequests,
  normalizeSort,
  sortDeliveryRequests
} from "@/lib/delivery/shared";

type DeliveryRequestRecord = {
  id: string;
  title: string;
  city: string;
  pickupAddress: string;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  dropoffAddress: string;
  dropoffLatitude?: number | null;
  dropoffLongitude?: number | null;
  scheduledDate: Date;
  scheduledTime: string;
  deliveryValueCents: number;
  estimatedMinutes: number;
  description: string;
  posterWhatsapp: string;
  posterName: string;
  rating: number;
  status?: DeliveryRequestStatus;
  acceptedAt?: Date | null;
  createdAt: Date;
  createdBy: {
    companyPlan: CompanyPlan | null;
    subscriptionStatus: CompanySubscriptionStatus;
  };
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
};

function coordinatesFromColumns(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): Coordinates | undefined {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return undefined;
  }

  return { latitude, longitude };
}

export function toDeliveryRequestSummary(request: DeliveryRequestRecord): DeliveryRequestSummary {
  return {
    id: request.id,
    title: request.title,
    city: request.city,
    pickupAddress: request.pickupAddress,
    pickupCoordinates: coordinatesFromColumns(request.pickupLatitude, request.pickupLongitude),
    dropoffAddress: request.dropoffAddress,
    dropoffCoordinates: coordinatesFromColumns(request.dropoffLatitude, request.dropoffLongitude),
    scheduledDate: request.scheduledDate.toISOString().slice(0, 10),
    scheduledTime: request.scheduledTime,
    deliveryValueCents: request.deliveryValueCents,
    estimatedMinutes: request.estimatedMinutes,
    description: request.description,
    posterWhatsapp: request.posterWhatsapp,
    posterName: request.posterName,
    companyPlan: request.createdBy.companyPlan,
    subscriptionStatus: request.createdBy.subscriptionStatus,
    isSponsored:
      isSponsoredCompanyPlan(request.createdBy.companyPlan) &&
      isSubscriptionActiveForPublishing(request.createdBy.subscriptionStatus),
    rating: request.rating,
    status: request.status,
    acceptedAt: request.acceptedAt?.toISOString() ?? null,
    acceptedBy: request.acceptedBy
      ? {
          id: request.acceptedBy.id,
          name: request.acceptedBy.name,
          whatsapp: request.acceptedBy.whatsapp ?? null
        }
      : null,
    review: request.review
      ? {
          id: request.review.id,
          rating: request.review.rating,
          comment: request.review.comment ?? null
        }
      : null,
    createdAt: request.createdAt.toISOString()
  };
}

type DeliverySearchOptions = {
  city: string;
  coordinates?: Coordinates;
  radiusKm?: number;
  sort: DeliverySort;
};

function getDeliveryOrderBy(sort: DeliverySort) {
  if (sort === "valor") return { deliveryValueCents: "desc" } as const;
  if (sort === "tempo") return { estimatedMinutes: "asc" } as const;
  return { createdAt: "desc" } as const;
}

export const getDeliverySearchRequests = cache(
  async ({ city, coordinates, radiusKm, sort }: DeliverySearchOptions) => {
  if (!process.env.DATABASE_URL) {
    return searchDeliveryRequests({
      city,
      coordinates,
      radiusKm,
      requests: fallbackDeliveryRequests,
      sort
    });
  }

  const { getPrisma } = await import("@/lib/prisma");
  const prisma = getPrisma();
  const hasRadiusSearch = Boolean(coordinates && radiusKm && radiusKm > 0);
  const visibleSince = getDeliveryRequestVisibilityCutoff();
  const requests = await prisma.deliveryRequest.findMany({
    where: hasRadiusSearch
      ? {
          status: "OPEN",
          createdAt: { gte: visibleSince },
          pickupLatitude: { not: null },
          pickupLongitude: { not: null }
        }
      : {
          city: {
            equals: city,
            mode: "insensitive"
          },
          status: "OPEN",
          createdAt: { gte: visibleSince }
        },
    include: {
      createdBy: {
        select: {
          companyPlan: true,
          subscriptionStatus: true
        }
      },
      acceptedBy: {
        select: {
          id: true,
          name: true,
          whatsapp: true
        }
      },
      review: {
        select: {
          id: true,
          rating: true,
          comment: true
        }
      }
    },
    orderBy: getDeliveryOrderBy(sort)
  });

  const mappedRequests = requests.map(toDeliveryRequestSummary);

    return searchDeliveryRequests({
      city,
      coordinates,
      radiusKm,
      requests: mappedRequests,
      sort
    });
  }
);

export const getDeliveryRequests = cache(async (city: string, sort: DeliverySort) =>
  getDeliverySearchRequests({ city, sort })
);

export const getCompanyManagedDeliveryRequests = cache(async (companyId: string | undefined) => {
  if (!companyId || !process.env.DATABASE_URL) return [];

  const { getPrisma } = await import("@/lib/prisma");
  const prisma = getPrisma();
  const requests = await prisma.deliveryRequest.findMany({
    where: {
      createdById: companyId,
      status: {
        in: ["TAKEN", "DONE"]
      }
    },
    include: {
      createdBy: {
        select: {
          companyPlan: true,
          subscriptionStatus: true
        }
      },
      acceptedBy: {
        select: {
          id: true,
          name: true,
          whatsapp: true
        }
      },
      review: {
        select: {
          id: true,
          rating: true,
          comment: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return requests.map(toDeliveryRequestSummary);
});
