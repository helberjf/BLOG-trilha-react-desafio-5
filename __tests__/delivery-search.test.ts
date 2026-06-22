import {
  fallbackDeliveryRequests,
  searchDeliveryRequests
} from "@/lib/delivery/shared";
import { toDeliveryRequestSummary } from "@/lib/delivery/requests";

describe("delivery request search", () => {
  it("filters by city when courier location is not provided", () => {
    const results = searchDeliveryRequests({
      city: "Sao Paulo",
      requests: fallbackDeliveryRequests,
      sort: "recentes"
    });

    expect(results.map(request => request.id)).toEqual(["seed-1", "seed-2"]);
  });

  it("filters by pickup radius across nearby cities", () => {
    const results = searchDeliveryRequests({
      city: "Sao Paulo",
      coordinates: { latitude: -23.5505, longitude: -46.6333 },
      radiusKm: 100,
      requests: fallbackDeliveryRequests,
      sort: "distancia"
    });

    expect(results.map(request => request.id)).toEqual(["seed-2", "seed-1", "seed-3"]);
    expect(results[0]?.pickupDistanceKm).toBeLessThan(3);
  });

  it("hides open requests created more than 24 hours ago", () => {
    const now = new Date("2026-05-31T12:00:00.000Z");
    const requests = [
      {
        ...fallbackDeliveryRequests[0],
        id: "recent",
        createdAt: "2026-05-30T13:00:00.000Z"
      },
      {
        ...fallbackDeliveryRequests[1],
        id: "expired",
        createdAt: "2026-05-30T11:59:59.000Z"
      }
    ];

    const results = searchDeliveryRequests({
      city: "Sao Paulo",
      now,
      requests,
      sort: "recentes"
    });

    expect(results.map(request => request.id)).toEqual(["recent"]);
  });

  it("hides requests that were already accepted in the app", () => {
    const results = searchDeliveryRequests({
      city: "Sao Paulo",
      requests: [
        {
          ...fallbackDeliveryRequests[0],
          id: "open",
          status: "OPEN"
        },
        {
          ...fallbackDeliveryRequests[1],
          id: "accepted",
          status: "TAKEN",
          acceptedBy: {
            id: "courier_1",
            name: "Joao Entregador",
            whatsapp: "11999990000"
          }
        }
      ],
      sort: "recentes"
    });

    expect(results.map(request => request.id)).toEqual(["open"]);
  });

  it("maps database coordinates into request summaries", () => {
    const summary = toDeliveryRequestSummary({
      id: "db-1",
      title: "Retirada com GPS",
      city: "Sao Paulo",
      pickupAddress: "Av. Paulista, 1000",
      pickupLatitude: -23.5729,
      pickupLongitude: -46.6424,
      dropoffAddress: "Rua Augusta, 500",
      dropoffLatitude: -23.5371,
      dropoffLongitude: -46.6426,
      scheduledDate: new Date("2026-05-24T00:00:00.000Z"),
      scheduledTime: "14:30",
      deliveryValueCents: 3500,
      estimatedMinutes: 45,
      description: "Envelope pequeno",
      posterWhatsapp: "11999998888",
      posterName: "Empresa Teste",
      rating: 4.5,
      createdAt: new Date("2026-05-23T10:00:00.000Z"),
      createdBy: {
        companyPlan: "EMPRESA",
        subscriptionStatus: "ACTIVE"
      }
    });

    expect(summary.pickupCoordinates).toEqual({ latitude: -23.5729, longitude: -46.6424 });
    expect(summary.dropoffCoordinates).toEqual({ latitude: -23.5371, longitude: -46.6426 });
  });
});
