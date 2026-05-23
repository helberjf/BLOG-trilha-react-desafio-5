"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { type LoginInput, loginSchema } from "@/lib/auth/validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/pedidos?cidade=Sao%20Paulo";
  const [error, setError] = useState<string | null>(null);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Email
        <input
          type="email"
          autoComplete="email"
          {...register("email")}
          className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-emerald-500"
        />
        {errors.email ? <span className="text-xs text-red-600">{errors.email.message}</span> : null}
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Senha
        <input
          type="password"
          autoComplete="current-password"
          {...register("password")}
          className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-emerald-500"
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
        Entrar
      </button>
    </form>
  );
}
