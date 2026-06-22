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
      return NextResponse.json({ error: "Entre como empresa para concluir a entrega." }, { status: 401 });
    }

    if (session.user.role !== "BUSINESS") {
      return NextResponse.json({ error: "Apenas empresas podem concluir entregas publicadas." }, { status: 403 });
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
        acceptedById: true,
        createdById: true,
        status: true
      }
    });

    if (!deliveryRequest) {
      return NextResponse.json({ error: "Entrega nao encontrada." }, { status: 404 });
    }

    if (deliveryRequest.createdById !== session.user.id) {
      return NextResponse.json({ error: "Voce so pode concluir entregas da sua empresa." }, { status: 403 });
    }

    if (deliveryRequest.status !== "TAKEN" || !deliveryRequest.acceptedById) {
      return NextResponse.json({ error: "A entrega precisa estar aceita antes de ser concluida." }, { status: 409 });
    }

    const updatedRequest = await prisma.deliveryRequest.update({
      where: { id },
      data: { status: "DONE" }
    });

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error("[DELIVERY_REQUEST_COMPLETE_ERROR]", error);
    return NextResponse.json({ error: "Erro ao concluir entrega." }, { status: 500 });
  }
}
