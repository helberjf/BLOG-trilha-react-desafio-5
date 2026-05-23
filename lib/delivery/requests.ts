import { cache } from "react";

import {
  type DeliverySort,
  fallbackDeliveryRequests,
  sortDeliveryRequests
} from "@/lib/delivery/shared";

export {
  type DeliveryRequestSummary,
  type DeliverySort,
  deliverySortOptions,
  fallbackDeliveryRequests,
  normalizeSort,
  sortDeliveryRequests
} from "@/lib/delivery/shared";

export const getDeliveryRequests = cache(async (city: string, sort: DeliverySort) => {
  const normalizedCity = city.trim().toLowerCase();

  if (!process.env.DATABASE_URL) {
    return sortDeliveryRequests(
      fallbackDeliveryRequests.filter(request => request.city.toLowerCase() === normalizedCity),
      sort
    );
  }

  const { getPrisma } = await import("@/lib/prisma");
  const prisma = getPrisma();
  const requests = await prisma.deliveryRequest.findMany({
    where: {
      city: {
        equals: city,
        mode: "insensitive"
      },
      status: "OPEN"
    },
    orderBy:
      sort === "avaliacoes"
        ? { rating: "desc" }
        : sort === "valor"
          ? { deliveryValueCents: "desc" }
          : sort === "tempo"
            ? { estimatedMinutes: "asc" }
            : { createdAt: "desc" }
  });

  return requests.map(request => ({
    id: request.id,
    title: request.title,
    city: request.city,
    pickupAddress: request.pickupAddress,
    dropoffAddress: request.dropoffAddress,
    scheduledDate: request.scheduledDate.toISOString().slice(0, 10),
    scheduledTime: request.scheduledTime,
    deliveryValueCents: request.deliveryValueCents,
    estimatedMinutes: request.estimatedMinutes,
    description: request.description,
    posterWhatsapp: request.posterWhatsapp,
    posterName: request.posterName,
    rating: request.rating,
    createdAt: request.createdAt.toISOString()
  }));
});
