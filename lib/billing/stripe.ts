import Stripe from "stripe";

import {
  companyPlans,
  getCompanyPlan,
  type CompanyPlan,
  type CompanySubscriptionStatus
} from "@/lib/billing/plans";

let stripeClient: Stripe | null = null;

export function hasStripeConfig() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_EMPRESA_PRICE_ID &&
      process.env.STRIPE_PATROCINADO_PRICE_ID &&
      process.env.STRIPE_WEBHOOK_SECRET
  );
}

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-05-27.dahlia"
    });
  }

  return stripeClient;
}

export function getStripePriceId(plan: CompanyPlan) {
  const details = companyPlans[plan];
  const priceId = process.env[details.stripePriceEnv];

  if (!priceId) {
    throw new Error(`${details.stripePriceEnv} is not configured`);
  }

  return priceId;
}

export function getAppUrl(request?: Request) {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  if (request) return new URL(request.url).origin;
  return "http://localhost:3000";
}

export function buildCheckoutSessionParams({
  appUrl,
  customerId,
  plan,
  priceId,
  userId
}: {
  appUrl: string;
  customerId: string;
  plan: CompanyPlan;
  priceId: string;
  userId: string;
}): Stripe.Checkout.SessionCreateParams {
  const details = companyPlans[plan];
  const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
    metadata: {
      plan,
      userId
    }
  };

  if (details.trialDays > 0) {
    subscriptionData.trial_period_days = details.trialDays;
  }

  return {
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/pedidos?assinatura=sucesso`,
    cancel_url: `${appUrl}/pedidos?assinatura=cancelada`,
    allow_promotion_codes: true,
    subscription_data: subscriptionData,
    metadata: {
      plan,
      userId
    }
  };
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status | null | undefined
): CompanySubscriptionStatus {
  if (status === "trialing") return "TRIALING";
  if (status === "active") return "ACTIVE";
  if (status === "past_due") return "PAST_DUE";
  if (status === "canceled") return "CANCELED";
  if (status === "unpaid") return "UNPAID";
  if (status === "incomplete" || status === "incomplete_expired") return "INCOMPLETE";
  return "NONE";
}

export function getPlanFromStripeMetadata(metadata: Stripe.Metadata | null | undefined) {
  return getCompanyPlan(metadata?.plan)?.id ?? null;
}

export function getPlanFromStripePriceId(priceId: string | null | undefined) {
  if (!priceId) return null;

  if (priceId === process.env.STRIPE_EMPRESA_PRICE_ID) return "EMPRESA";
  if (priceId === process.env.STRIPE_PATROCINADO_PRICE_ID) return "PATROCINADO";
  return null;
}

export function unixToDate(value: number | null | undefined) {
  return value ? new Date(value * 1000) : null;
}
