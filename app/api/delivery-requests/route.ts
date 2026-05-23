import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { canCreateDeliveryRequest } from "@/lib/delivery/permissions";
import { getDeliveryRequests, normalizeSort } from "@/lib/delivery/requests";
import { deliveryRequestSchema } from "@/lib/delivery/validators";
import { currencyToCents, normalizeDigits } from "@/lib/delivery/format";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const city = url.searchParams.get("cidade") || "Sao Paulo";
  const sort = normalizeSort(url.searchParams.get("ordenar") ?? undefined);
  const requests = await getDeliveryRequests(city, sort);

  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Entre para publicar um pedido." }, { status: 401 });
    }

    if (!canCreateDeliveryRequest(session.user)) {
      return NextResponse.json(
        { error: "Apenas empresarios com CNPJ valido podem publicar pedidos." },
        { status: 403 }
      );
    }

    if (!hasDatabaseUrl()) {
      return NextResponse.json(
        { error: "Supabase ainda nao configurado. Envie a DATABASE_URL para salvar pedidos." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const data = deliveryRequestSchema.parse(body);
    const prisma = getPrisma();

    const requestCreated = await prisma.deliveryRequest.create({
      data: {
        title: data.title,
        city: data.city,
        pickupAddress: data.pickupAddress,
        dropoffAddress: data.dropoffAddress,
        scheduledDate: new Date(`${data.scheduledDate}T00:00:00.000Z`),
        scheduledTime: data.scheduledTime,
        deliveryValueCents: currencyToCents(data.deliveryValue),
        estimatedMinutes: data.estimatedMinutes,
        description: data.description,
        posterWhatsapp: normalizeDigits(data.posterWhatsapp),
        posterName: session.user.name ?? "Empresa",
        createdById: session.user.id
      }
    });

    return NextResponse.json({ request: requestCreated }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Dados invalidos." },
        { status: 400 }
      );
    }

    console.error("[DELIVERY_REQUEST_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Erro ao publicar pedido." }, { status: 500 });
  }
}
