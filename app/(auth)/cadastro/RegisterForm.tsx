"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, BriefcaseBusiness, Loader2, MapPin, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { type RegisterInput, registerSchema } from "@/lib/auth/validation";

const inputClass =
  "min-h-11 w-full min-w-0 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500";

type RegisterFormProps = {
  initialRole?: RegisterInput["role"];
};

export function RegisterForm({ initialRole = "COURIER" }: RegisterFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RegisterInput["role"]>(initialRole);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: initialRole
    }
  });
  const roleField = register("role");
  const accountPitch =
    selectedRole === "BUSINESS"
      ? {
          icon: BriefcaseBusiness,
          eyebrow: "Conta empresarial",
          title: "Publique pedidos com CNPJ verificado",
          description:
            "Cadastre demandas com retirada, entrega, horario, valor e WhatsApp para receber contatos mais qualificados.",
          items: ["Selo de empresa verificada", "Pedidos destacados por cidade", "Historico para operacao recorrente"]
        }
      : {
          icon: WalletCards,
          eyebrow: "Conta entregador",
          title: "Receba oportunidades por cidade",
          description:
            "Veja pedidos recentes, compare valores e escolha rotas que fazem sentido para sua agenda.",
          items: ["Filtros por valor e avaliacao", "Contato direto no WhatsApp", "Pedidos com local e horario claros"]
        };
  const PitchIcon = accountPitch.icon;

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
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
          <PitchIcon size={22} />
        </div>
        <p className="mt-4 text-xs font-bold uppercase text-emerald-700">{accountPitch.eyebrow}</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">{accountPitch.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{accountPitch.description}</p>
        <div className="mt-5 grid gap-2">
          {accountPitch.items.map(item => (
            <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <BadgeCheck size={17} className="text-emerald-700" />
              {item}
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-md bg-white p-3 text-sm font-semibold text-slate-700">
          <MapPin size={17} className="text-emerald-700" />
          Operacao pensada para cidade, bairro e rota.
        </div>
      </aside>

      <form onSubmit={handleSubmit(onSubmit)} className="grid min-w-0 gap-4">
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
        ) : (
          <Field label="CPF" error={errors.cpf?.message}>
            <input {...register("cpf")} className={inputClass} placeholder="000.000.000-00" />
          </Field>
        )}

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
    </div>
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
