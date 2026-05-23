import Link from "next/link";

import { RegisterForm } from "@/app/(auth)/cadastro/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-2xl place-items-center px-5 py-10">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-sm font-bold text-emerald-700">
          Entregador
        </Link>
        <h1 className="mt-4 text-3xl font-black text-slate-950">Criar conta</h1>
        <p className="mt-2 text-sm text-slate-600">
          Escolha se voce e empresario ou entregador. Empresarios precisam informar CNPJ.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
