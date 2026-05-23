import {
  type DeliveryRequestSummary,
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

  it("sorts by best rating first", () => {
    expect(sortDeliveryRequests(requests, "avaliacoes")[0]?.id).toBe("b");
  });

  it("sorts by highest delivery value first", () => {
    expect(sortDeliveryRequests(requests, "valor")[0]?.id).toBe("b");
  });

  it("sorts by shortest estimated time first", () => {
    expect(sortDeliveryRequests(requests, "tempo")[0]?.id).toBe("b");
  });
});
