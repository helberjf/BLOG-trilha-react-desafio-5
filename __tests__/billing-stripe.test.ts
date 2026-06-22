import { buildCheckoutSessionParams } from "@/lib/billing/stripe";

describe("Stripe checkout session params", () => {
  it("builds subscription checkout for the Empresa plan with trial", () => {
    const params = buildCheckoutSessionParams({
      appUrl: "https://entrega.example.com",
      customerId: "cus_123",
      plan: "EMPRESA",
      priceId: "price_empresa",
      userId: "user_1"
    });

    expect(params.mode).toBe("subscription");
    expect(params.customer).toBe("cus_123");
    expect(params.line_items).toEqual([{ price: "price_empresa", quantity: 1 }]);
    expect(params.subscription_data).toEqual({
      trial_period_days: 60,
      metadata: { plan: "EMPRESA", userId: "user_1" }
    });
    expect(params.success_url).toBe("https://entrega.example.com/pedidos?assinatura=sucesso");
    expect(params.cancel_url).toBe("https://entrega.example.com/pedidos?assinatura=cancelada");
  });

  it("builds sponsored checkout without trial", () => {
    const params = buildCheckoutSessionParams({
      appUrl: "https://entrega.example.com",
      customerId: "cus_123",
      plan: "PATROCINADO",
      priceId: "price_patrocinado",
      userId: "user_1"
    });

    expect(params.subscription_data).toEqual({
      metadata: { plan: "PATROCINADO", userId: "user_1" }
    });
  });
});
