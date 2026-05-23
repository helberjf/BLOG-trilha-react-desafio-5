"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { type RegisterInput, registerSchema } from "@/lib/auth/validation";

const inputClass =
  "min-h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RegisterInput["role"]>("COURIER");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "COURIER"
    }
  });
  const roleField = register("role");

  async function onSubmit(data: RegisterInput) {
    setServerError(null);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setServerError(payload.error ?? "Nao foi possivel criar a conta.");
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome" error={errors.name?.message}>
          <input {...register("name")} className={inputClass} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="email" {...register("email")} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Tipo de conta" error={errors.role?.message}>
          <select
            {...roleField}
            onChange={event => {
              roleField.onChange(event);
              setSelectedRole(event.target.value as RegisterInput["role"]);
            }}
            className={inputClass}
          >
            <option value="COURIER">Entregador</option>
            <option value="BUSINESS">Empresario</option>
          </select>
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp?.message}>
          <input {...register("whatsapp")} className={inputClass} placeholder="(11) 99999-8888" />
        </Field>
      </div>

      {selectedRole === "BUSINESS" ? (
        <Field label="CNPJ" error={errors.cnpj?.message}>
          <input {...register("cnpj")} className={inputClass} placeholder="11.222.333/0001-81" />
        </Field>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Senha" error={errors.password?.message}>
          <input type="password" autoComplete="new-password" {...register("password")} className={inputClass} />
        </Field>
        <Field label="Confirmar senha" error={errors.confirm?.message}>
          <input type="password" autoComplete="new-password" {...register("confirm")} className={inputClass} />
        </Field>
      </div>

      {serverError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
        Criar conta
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      {label}
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
