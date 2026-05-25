import Link from "next/link";
import { Bike } from "lucide-react";
import { Suspense } from "react";

import { LoginForm } from "@/app/(auth)/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Bike size={19} />
            </span>
            EntregaApp
          </Link>
          <h1 className="mt-4 text-2xl font-black text-slate-950">Entrar na sua conta</h1>
          <p className="mt-1 text-sm text-slate-500">Publique pedidos ou encontre entregas perto de voce.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Suspense fallback={<p className="text-sm text-slate-500">Carregando...</p>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Ainda nao tem conta?{" "}
          <Link href="/cadastro" className="font-bold text-emerald-700 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
