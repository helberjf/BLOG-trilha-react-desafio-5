import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Entre como entregador para aceitar a entrega." }, { status: 401 });
    }

    if (session.user.role !== "COURIER") {
      return NextResponse.json({ error: "Apenas entregadores podem aceitar entregas." }, { status: 403 });
    }

    if (!hasDatabaseUrl()) {
      return NextResponse.json({ error: "Banco de dados ainda nao configurado." }, { status: 503 });
    }

    const { id } = await context.params;
    const prisma = getPrisma();
    const deliveryRequest = await prisma.deliveryRequest.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        acceptedById: true
      }
    });

    if (!deliveryRequest) {
      return NextResponse.json({ error: "Entrega nao encontrada." }, { status: 404 });
    }

    if (deliveryRequest.status !== "OPEN" || deliveryRequest.acceptedById) {
      return NextResponse.json({ error: "Esta entrega ja foi aceita." }, { status: 409 });
    }

    const updatedRequest = await prisma.deliveryRequest.update({
      where: { id },
      data: {
        acceptedById: session.user.id,
        acceptedAt: new Date(),
        status: "TAKEN"
      }
    });

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error("[DELIVERY_REQUEST_ACCEPT_ERROR]", error);
    return NextResponse.json({ error: "Erro ao aceitar entrega." }, { status: 500 });
  }
}
