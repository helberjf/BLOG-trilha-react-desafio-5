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
        cnpj: null,
        subscriptionStatus: "ACTIVE"
      })
    ).toBe(false);
  });

  it("blocks business users without an active subscription", () => {
    expect(
      canCreateDeliveryRequest({
        role: "BUSINESS",
        cnpj: "11.222.333/0001-81",
        cpf: "529.982.247-25",
        companyPostalCode: "36010-000",
        subscriptionStatus: "CANCELED"
      })
    ).toBe(false);
  });

  it("blocks business users without CPF and CNPJ postal code", () => {
    expect(
      canCreateDeliveryRequest({
        role: "BUSINESS",
        cnpj: "11.222.333/0001-81",
        subscriptionStatus: "ACTIVE"
      })
    ).toBe(false);
  });

  it("allows business users with valid CNPJ, CPF, postal code and active subscription", () => {
    expect(
      canCreateDeliveryRequest({
        role: "BUSINESS",
        cnpj: "11.222.333/0001-81",
        cpf: "529.982.247-25",
        companyPostalCode: "36010-000",
        subscriptionStatus: "ACTIVE"
      })
    ).toBe(true);
  });

  it("allows business users during the Stripe trial period", () => {
    expect(
      canCreateDeliveryRequest({
        role: "BUSINESS",
        cnpj: "11.222.333/0001-81",
        cpf: "529.982.247-25",
        companyPostalCode: "36010-000",
        subscriptionStatus: "TRIALING"
      })
    ).toBe(true);
  });
});
