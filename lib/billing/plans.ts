export type CompanyPlan = "EMPRESA" | "PATROCINADO";

export type CompanySubscriptionStatus =
  | "NONE"
  | "INCOMPLETE"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID";

export type CompanyPlanDetails = {
  id: CompanyPlan;
  name: string;
  priceCents: number;
  trialDays: number;
  stripePriceEnv: string;
  sponsored: boolean;
  description: string;
  benefits: string[];
};

export const companyPlans: Record<CompanyPlan, CompanyPlanDetails> = {
  EMPRESA: {
    id: "EMPRESA",
    name: "Empresa",
    priceCents: 3590,
    trialDays: 60,
    stripePriceEnv: "STRIPE_EMPRESA_PRICE_ID",
    sponsored: false,
    description: "Publique pedidos por cidade com CNPJ validado.",
    benefits: ["Publicacao de pedidos", "CNPJ validado", "Contato direto pelo WhatsApp"]
  },
  PATROCINADO: {
    id: "PATROCINADO",
    name: "Patrocinado",
    priceCents: 6990,
    trialDays: 0,
    stripePriceEnv: "STRIPE_PATROCINADO_PRICE_ID",
    sponsored: true,
    description: "Pedidos aparecem primeiro no mural com selo Patrocinado.",
    benefits: ["Prioridade no mural", "Selo Patrocinado", "Mais visibilidade por cidade"]
  }
};

export const companyPlanList = [companyPlans.EMPRESA, companyPlans.PATROCINADO] as const;

export function getCompanyPlan(value: string | null | undefined) {
  if (value === "EMPRESA" || value === "PATROCINADO") {
    return companyPlans[value];
  }

  return null;
}

export function isSubscriptionActiveForPublishing(status: CompanySubscriptionStatus | null | undefined) {
  return status === "TRIALING" || status === "ACTIVE";
}

export function isSponsoredCompanyPlan(plan: CompanyPlan | null | undefined) {
  return plan === "PATROCINADO";
}

export function formatPlanPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  })
    .format(cents / 100)
    .replace(/\u00a0/g, " ");
}
