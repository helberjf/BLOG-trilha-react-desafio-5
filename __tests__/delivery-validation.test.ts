import {
  centsToCurrency,
  currencyToCents,
  formatWhatsAppUrl,
  isValidCnpj,
  normalizeDigits
} from "@/lib/delivery/format";
import {
  deliveryReviewSchema,
  deliveryRequestSchema,
  resolveDeliveryRequestCoordinates
} from "@/lib/delivery/validators";

describe("delivery formatting and validation", () => {
  it("validates CNPJ numbers", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("11.111.111/1111-11")).toBe(false);
    expect(isValidCnpj("123")).toBe(false);
  });

  it("normalizes digits", () => {
    expect(normalizeDigits("(11) 99999-8888")).toBe("11999998888");
  });

  it("formats WhatsApp redirect URLs", () => {
    expect(formatWhatsAppUrl("(11) 99999-8888", "Tenho interesse na entrega")).toBe(
      "https://wa.me/5511999998888?text=Tenho%20interesse%20na%20entrega"
    );
  });

  it("converts delivery values between display and cents", () => {
    expect(currencyToCents("49,90")).toBe(4990);
    expect(currencyToCents("R$ 120.50")).toBe(12050);
    expect(centsToCurrency(4990)).toBe("R$ 49,90");
  });

  it("requires core delivery request fields", () => {
    const result = deliveryRequestSchema.safeParse({
      title: "Retirada de documentos",
      city: "Sao Paulo",
      pickupAddress: "Av. Paulista, 1000",
      dropoffAddress: "Rua Augusta, 500",
      scheduledDate: "2026-05-24",
      scheduledTime: "14:30",
      deliveryValue: "35,00",
      estimatedMinutes: 45,
      description: "Envelope pequeno",
      posterWhatsapp: "(11) 99999-8888"
    });

    expect(result.success).toBe(true);
  });

  it("normalizes explicit pickup coordinates for radius search", () => {
    const result = deliveryRequestSchema.parse({
      title: "Retirada de documentos",
      city: "Sao Paulo",
      pickupAddress: "Av. Paulista, 1000",
      dropoffAddress: "Rua Augusta, 500",
      scheduledDate: "2026-05-24",
      scheduledTime: "14:30",
      deliveryValue: "35,00",
      estimatedMinutes: 45,
      description: "Envelope pequeno",
      posterWhatsapp: "(11) 99999-8888",
      pickupLatitude: "-23.5729",
      pickupLongitude: "-46.6424"
    });

    expect(resolveDeliveryRequestCoordinates(result).pickupCoordinates).toEqual({
      latitude: -23.5729,
      longitude: -46.6424
    });
  });

  it("falls back to city coordinates when pickup GPS is not provided", () => {
    const result = deliveryRequestSchema.parse({
      title: "Retirada de documentos",
      city: "Sao Paulo",
      pickupAddress: "Av. Paulista, 1000",
      dropoffAddress: "Rua Augusta, 500",
      scheduledDate: "2026-05-24",
      scheduledTime: "14:30",
      deliveryValue: "35,00",
      estimatedMinutes: 45,
      description: "Envelope pequeno",
      posterWhatsapp: "(11) 99999-8888"
    });

    expect(resolveDeliveryRequestCoordinates(result).pickupCoordinates).toEqual({
      latitude: -23.5505,
      longitude: -46.6333
    });
  });

  it("validates company reviews for accepted couriers", () => {
    const result = deliveryReviewSchema.safeParse({
      rating: "5",
      comment: "Chegou no horario combinado e avisou a empresa pelo WhatsApp."
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBe(5);
    }

    expect(deliveryReviewSchema.safeParse({ rating: 6 }).success).toBe(false);
  });
});
