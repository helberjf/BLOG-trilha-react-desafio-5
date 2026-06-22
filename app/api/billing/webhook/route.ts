import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  getPlanFromStripeMetadata,
  getPlanFromStripePriceId,
  getStripe,
  mapStripeSubscriptionStatus,
  unixToDate
} from "@/lib/billing/stripe";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL precisa estar configurada." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook da Stripe nao configurado." }, { status: 400 });
  }

  const stripe = getStripe();
  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_SIGNATURE_ERROR]", error);
    return NextResponse.json({ error: "Assinatura do webhook invalida." }, { status: 400 });
  }

  const prisma = getPrisma();

  try {
    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.metadata?.userId;
      const subscriptionId =
        typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : checkoutSession.subscription?.id;
      const customerId =
        typeof checkoutSession.customer === "string" ? checkoutSession.customer : checkoutSession.customer?.id;

      if (userId && subscriptionId && customerId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id ?? null;
        const plan =
          getPlanFromStripeMetadata(checkoutSession.metadata) ??
          getPlanFromStripeMetadata(subscription.metadata) ??
          getPlanFromStripePriceId(priceId);

        await prisma.user.update({
          where: { id: userId },
          data: {
            companyPlan: plan,
            subscriptionStatus: mapStripeSubscriptionStatus(subscription.status),
            trialEndsAt: unixToDate(subscription.trial_end),
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId
          }
        });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id ?? null;
      const plan = getPlanFromStripeMetadata(subscription.metadata) ?? getPlanFromStripePriceId(priceId);

      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          companyPlan: plan,
          subscriptionStatus: mapStripeSubscriptionStatus(subscription.status),
          trialEndsAt: unixToDate(subscription.trial_end),
          stripePriceId: priceId
        }
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Erro ao processar webhook da Stripe." }, { status: 500 });
  }
}
