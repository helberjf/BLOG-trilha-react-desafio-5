import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { getCompanyPlan } from "@/lib/billing/plans";
import { buildCheckoutSessionParams, getAppUrl, getStripe, getStripePriceId } from "@/lib/billing/stripe";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  plan: z.enum(["EMPRESA", "PATROCINADO"])
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Entre para assinar um plano." }, { status: 401 });
    }

    if (session.user.role !== "BUSINESS") {
      return NextResponse.json({ error: "Apenas contas empresariais podem assinar planos." }, { status: 403 });
    }

    if (!hasDatabaseUrl()) {
      return NextResponse.json({ error: "DATABASE_URL precisa estar configurada para assinar planos." }, { status: 503 });
    }

    const data = checkoutSchema.parse(await request.json());
    const plan = getCompanyPlan(data.plan);
    if (!plan) {
      return NextResponse.json({ error: "Plano invalido." }, { status: 400 });
    }

    const prisma = getPrisma();
    const stripe = getStripe();
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (!user?.email) {
      return NextResponse.json({ error: "Usuario empresarial nao encontrado." }, { status: 404 });
    }

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: {
          userId: user.id
        }
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId }
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create(
      buildCheckoutSessionParams({
        appUrl: getAppUrl(request),
        customerId: stripeCustomerId,
        plan: plan.id,
        priceId: getStripePriceId(plan.id),
        userId: user.id
      })
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Plano invalido." }, { status: 400 });
    }

    console.error("[BILLING_CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: "Nao foi possivel iniciar o checkout." }, { status: 500 });
  }
}
