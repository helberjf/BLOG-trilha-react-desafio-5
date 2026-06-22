import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { deliveryReviewSchema } from "@/lib/delivery/validators";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Entre como empresa para avaliar o entregador." }, { status: 401 });
    }

    if (session.user.role !== "BUSINESS") {
      return NextResponse.json({ error: "Apenas empresas podem avaliar entregadores." }, { status: 403 });
    }

    if (!hasDatabaseUrl()) {
      return NextResponse.json({ error: "Banco de dados ainda nao configurado." }, { status: 503 });
    }

    const data = deliveryReviewSchema.parse(await request.json());
    const { id } = await context.params;
    const prisma = getPrisma();
    const deliveryRequest = await prisma.deliveryRequest.findUnique({
      where: { id },
      select: {
        id: true,
        acceptedById: true,
        createdById: true,
        status: true,
        review: {
          select: {
            id: true
          }
        }
      }
    });

    if (!deliveryRequest) {
      return NextResponse.json({ error: "Entrega nao encontrada." }, { status: 404 });
    }

    if (deliveryRequest.createdById !== session.user.id) {
      return NextResponse.json({ error: "Voce so pode avaliar entregas da sua empresa." }, { status: 403 });
    }

    if (deliveryRequest.status !== "DONE" || !deliveryRequest.acceptedById) {
      return NextResponse.json({ error: "Conclua a entrega antes de avaliar o entregador." }, { status: 409 });
    }

    if (deliveryRequest.review) {
      return NextResponse.json({ error: "Esta entrega ja possui avaliacao." }, { status: 409 });
    }

    const review = await prisma.deliveryReview.create({
      data: {
        requestId: id,
        companyId: session.user.id,
        courierId: deliveryRequest.acceptedById,
        rating: data.rating,
        comment: data.comment
      }
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Dados invalidos." },
        { status: 400 }
      );
    }

    console.error("[DELIVERY_REQUEST_REVIEW_ERROR]", error);
    return NextResponse.json({ error: "Erro ao avaliar entregador." }, { status: 500 });
  }
}
