import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getAppUrl, getStripe } from "@/lib/billing/stripe";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Entre para gerenciar sua assinatura." }, { status: 401 });
    }

    if (!hasDatabaseUrl()) {
      return NextResponse.json({ error: "DATABASE_URL precisa estar configurada." }, { status: 503 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "Nenhuma assinatura encontrada para esta conta." }, { status: 404 });
    }

    const stripe = getStripe();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${getAppUrl(request)}/pedidos?assinatura=portal`
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[BILLING_PORTAL_ERROR]", error);
    return NextResponse.json({ error: "Nao foi possivel abrir o portal de assinatura." }, { status: 500 });
  }
}
