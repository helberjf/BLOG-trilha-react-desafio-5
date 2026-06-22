import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { registerSchema } from "@/lib/auth/validation";
import { normalizeDigits } from "@/lib/delivery/format";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!hasDatabaseUrl()) {
      return NextResponse.json(
        { error: "Supabase ainda nao configurado. Envie a DATABASE_URL para ativar cadastros." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const data = registerSchema.parse(body);
    const prisma = getPrisma();
    const email = data.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email ja cadastrado." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        name: data.name,
        email,
        password: passwordHash,
        role: data.role,
        cnpj: data.role === "BUSINESS" ? normalizeDigits(data.cnpj) : null,
        cpf: normalizeDigits(data.cpf),
        companyPostalCode: data.role === "BUSINESS" ? normalizeDigits(data.companyPostalCode) : null,
        whatsapp: normalizeDigits(data.whatsapp)
      }
    });

    return NextResponse.json({ message: "Usuario cadastrado com sucesso." }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Dados invalidos." },
        { status: 400 }
      );
    }

    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Erro ao cadastrar usuario." }, { status: 500 });
  }
}
