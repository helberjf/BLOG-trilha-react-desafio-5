import Link from "next/link";

import { RegisterForm } from "@/app/(auth)/cadastro/RegisterForm";
import type { RegisterInput } from "@/lib/auth/validation";

type RegisterPageProps = {
  searchParams?: Promise<{
    tipo?: string | string[];
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const tipo = Array.isArray(params?.tipo) ? params.tipo[0] : params?.tipo;
  const initialRole: RegisterInput["role"] = tipo === "empresa" ? "BUSINESS" : "COURIER";

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-5xl place-items-center px-5 py-10">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-sm font-bold text-emerald-700">
          EntregaApp
        </Link>
        <h1 className="mt-4 text-3xl font-black text-slate-950">Criar conta</h1>
        <p className="mt-2 text-sm text-slate-600">
          Escolha se voce e empresario ou entregador. Empresarios precisam informar CNPJ.
        </p>
        <div className="mt-6">
          <RegisterForm initialRole={initialRole} />
        </div>
      </section>
    </main>
  );
}
