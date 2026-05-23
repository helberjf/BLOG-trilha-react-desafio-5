import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/app/(auth)/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-5 py-10">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-sm font-bold text-emerald-700">
          Entregador
        </Link>
        <h1 className="mt-4 text-3xl font-black text-slate-950">Entrar</h1>
        <p className="mt-2 text-sm text-slate-600">Acesse sua conta para publicar pedidos.</p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-slate-600">Carregando formulario...</p>}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-5 text-center text-sm text-slate-600">
          Ainda nao tem conta?{" "}
          <Link href="/cadastro" className="font-bold text-emerald-700">
            Criar conta
          </Link>
        </p>
      </section>
    </main>
  );
}
