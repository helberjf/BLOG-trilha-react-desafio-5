import { canCreateDeliveryRequest } from "@/lib/delivery/permissions";

describe("delivery request permissions", () => {
  it("blocks anonymous users", () => {
    expect(canCreateDeliveryRequest(null)).toBe(false);
  });

  it("blocks courier users", () => {
    expect(
      canCreateDeliveryRequest({
        role: "COURIER",
        cnpj: null
      })
    ).toBe(false);
  });

  it("blocks business users without CNPJ", () => {
    expect(
      canCreateDeliveryRequest({
        role: "BUSINESS",
        cnpj: null
      })
    ).toBe(false);
  });

  it("allows business users with valid CNPJ", () => {
    expect(
      canCreateDeliveryRequest({
        role: "BUSINESS",
        cnpj: "11.222.333/0001-81"
      })
    ).toBe(true);
  });
});
