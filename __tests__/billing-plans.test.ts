import {
  companyPlans,
  getCompanyPlan,
  isSubscriptionActiveForPublishing
} from "@/lib/billing/plans";

describe("company billing plans", () => {
  it("defines the Empresa plan with 60 trial days", () => {
    expect(companyPlans.EMPRESA.name).toBe("Empresa");
    expect(companyPlans.EMPRESA.priceCents).toBe(3590);
    expect(companyPlans.EMPRESA.trialDays).toBe(60);
    expect(companyPlans.EMPRESA.stripePriceEnv).toBe("STRIPE_EMPRESA_PRICE_ID");
  });

  it("defines the Patrocinado plan without trial", () => {
    expect(companyPlans.PATROCINADO.name).toBe("Patrocinado");
    expect(companyPlans.PATROCINADO.priceCents).toBe(6990);
    expect(companyPlans.PATROCINADO.trialDays).toBe(0);
    expect(companyPlans.PATROCINADO.stripePriceEnv).toBe("STRIPE_PATROCINADO_PRICE_ID");
  });

  it("rejects unknown company plans", () => {
    expect(getCompanyPlan("EMPRESA")).toBe(companyPlans.EMPRESA);
    expect(getCompanyPlan("PATROCINADO")).toBe(companyPlans.PATROCINADO);
    expect(getCompanyPlan("FREE")).toBeNull();
  });

  it("allows publishing only for active or trialing subscriptions", () => {
    expect(isSubscriptionActiveForPublishing("TRIALING")).toBe(true);
    expect(isSubscriptionActiveForPublishing("ACTIVE")).toBe(true);
    expect(isSubscriptionActiveForPublishing("PAST_DUE")).toBe(false);
    expect(isSubscriptionActiveForPublishing("CANCELED")).toBe(false);
    expect(isSubscriptionActiveForPublishing(null)).toBe(false);
  });
});
