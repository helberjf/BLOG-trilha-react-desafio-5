"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, Loader2, WalletCards } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { type LoginInput, loginSchema } from "@/lib/auth/validation";

type AccountIntent = "COURIER" | "BUSINESS";

function accountIntentFromParam(tipo: string | null): AccountIntent {
  return tipo === "empresa" ? "BUSINESS" : "COURIER";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/pedidos?cidade=Sao%20Paulo";
  const tipoParam = searchParams?.get("tipo") ?? null;
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [accountIntent, setAccountIntent] = useState<AccountIntent>(() => accountIntentFromParam(tipoParam));
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  async function onSubmit(data: LoginInput) {
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl
    });

    if (!result || result.error) {
      setError("Email ou senha invalidos.");
      return;
    }

    router.push(callbackUrl);
  }

  async function handleGoogleSignIn() {
    if (accountIntent === "BUSINESS") {
      setError("Empresas entram com email e senha para manter CNPJ, CPF e assinatura vinculados.");
      return;
    }

    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl });
  }

  function buildIntentUrl(intent: AccountIntent) {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("tipo", intent === "BUSINESS" ? "empresa" : "entregador");
    const query = params.toString();
    return `/login${query ? `?${query}` : ""}`;
  }

  function handleIntentChange(intent: AccountIntent) {
    setAccountIntent(intent);
    router.replace(buildIntentUrl(intent), { scroll: false });
  }

  const intentContent =
    accountIntent === "BUSINESS"
      ? {
          selectedLabel: "empresa",
          formTitle: "Acesso da empresa",
          emailLabel: "Email da empresa",
          description: "Publique pedidos e gerencie sua assinatura empresarial.",
          registerHref: "/cadastro?tipo=empresa",
          registerLabel: "Criar conta empresarial",
          submitLabel: "Entrar como empresa com email"
        }
      : {
          selectedLabel: "entregador",
          formTitle: "Acesso do entregador",
          emailLabel: "Email do entregador",
          description: "Entre para encontrar pedidos por cidade e falar direto com empresas.",
          registerHref: "/cadastro?tipo=entregador",
          registerLabel: "Criar conta como entregador",
          submitLabel: "Entrar como entregador com email"
        };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 rounded-lg bg-slate-100 p-1 sm:grid-cols-2">
        <button
          type="button"
          aria-pressed={accountIntent === "COURIER"}
          onClick={() => handleIntentChange("COURIER")}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-black transition ${
            accountIntent === "COURIER"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
          }`}
        >
          <WalletCards size={17} />
          Entrar como entregador
        </button>
        <button
          type="button"
          aria-pressed={accountIntent === "BUSINESS"}
          onClick={() => handleIntentChange("BUSINESS")}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-black transition ${
            accountIntent === "BUSINESS"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
          }`}
        >
          <BriefcaseBusiness size={17} />
          Entrar como empresa
        </button>
      </div>

      <p aria-live="polite" className="text-xs font-black uppercase text-emerald-700">
        Acesso selecionado: {intentContent.selectedLabel}
      </p>

      <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold leading-6 text-emerald-900">
        {intentContent.description}
      </p>

      {accountIntent === "COURIER" ? (
        <>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-md border border-slate-200 bg-white font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            )}
            Entrar com Google
          </button>

          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400">ou</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      ) : (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold leading-6 text-amber-900">
          Empresas entram com email e senha para manter CNPJ, CPF do responsavel e assinatura vinculados.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-950">{intentContent.formTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">Use seu email e senha para continuar.</p>
        </div>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {intentContent.emailLabel}
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className="min-h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-emerald-500"
          />
          {errors.email ? <span className="text-xs text-red-600">{errors.email.message}</span> : null}
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Senha
          <input
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="min-h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-emerald-500"
          />
          {errors.password ? <span className="text-xs text-red-600">{errors.password.message}</span> : null}
        </label>
        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
          {intentContent.submitLabel}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Ainda nao tem conta?{" "}
        <Link href={intentContent.registerHref} className="font-bold text-emerald-700 hover:underline">
          {intentContent.registerLabel}
        </Link>
      </p>
    </div>
  );
}
