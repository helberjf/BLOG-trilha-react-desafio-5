import {
  type DeliveryRequestSummary,
  type DeliverySort,
  deliverySortOptions,
  normalizeSort,
  sortDeliveryRequests
} from "@/lib/delivery/shared";

const requests: DeliveryRequestSummary[] = [
  {
    id: "a",
    title: "Baixo valor",
    city: "Sao Paulo",
    pickupAddress: "A",
    dropoffAddress: "B",
    scheduledDate: "2026-05-24",
    scheduledTime: "13:00",
    deliveryValueCents: 1500,
    estimatedMinutes: 60,
    description: "Teste",
    posterWhatsapp: "11999998888",
    posterName: "Loja A",
    rating: 4.2,
    createdAt: "2026-05-23T10:00:00.000Z"
  },
  {
    id: "b",
    title: "Melhor avaliacao",
    city: "Sao Paulo",
    pickupAddress: "A",
    dropoffAddress: "B",
    scheduledDate: "2026-05-24",
    scheduledTime: "14:00",
    deliveryValueCents: 4500,
    estimatedMinutes: 30,
    description: "Teste",
    posterWhatsapp: "11999997777",
    posterName: "Loja B",
    rating: 4.9,
    createdAt: "2026-05-23T09:00:00.000Z"
  }
];

describe("delivery request sorting", () => {
  it("sorts by newest first", () => {
    expect(sortDeliveryRequests(requests, "recentes")[0]?.id).toBe("a");
  });

  it("does not expose company rating sorting", () => {
    expect(deliverySortOptions.some(option => option.value === "avaliacoes")).toBe(false);
    expect(sortDeliveryRequests(requests, "avaliacoes")[0]?.id).toBe("a");
  });

  it("sorts by highest delivery value first", () => {
    expect(sortDeliveryRequests(requests, "valor")[0]?.id).toBe("b");
  });

  it("sorts by shortest estimated time first", () => {
    expect(sortDeliveryRequests(requests, "tempo")[0]?.id).toBe("b");
  });

  it("keeps sponsored requests first inside the selected sort", () => {
    const sponsoredRequests: DeliveryRequestSummary[] = [
      {
        ...requests[0],
        id: "common-new",
        createdAt: "2026-05-23T12:00:00.000Z",
        isSponsored: false
      },
      {
        ...requests[1],
        id: "sponsored-old",
        createdAt: "2026-05-23T08:00:00.000Z",
        isSponsored: true
      }
    ];

    expect(sortDeliveryRequests(sponsoredRequests, "recentes")[0]?.id).toBe("sponsored-old");
  });

  it("accepts distance as a delivery sort option", () => {
    const distanceSort: DeliverySort = "distancia";

    expect(normalizeSort("distancia")).toBe(distanceSort);
  });
});
