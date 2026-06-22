"use client";

import { Loader2, ShieldCheck, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { companyPlanList, formatPlanPrice, type CompanyPlan } from "@/lib/billing/plans";

type PricingPlansProps = {
  title?: string;
  description?: string;
  compact?: boolean;
  enableCheckout?: boolean;
};

export function PricingPlans({
  title = "Planos para empresas",
  description = "Escolha um plano para publicar pedidos com CNPJ validado.",
  compact = false,
  enableCheckout = false
}: PricingPlansProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<CompanyPlan | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePlanClick(plan: CompanyPlan) {
    setMessage(null);

    if (!enableCheckout || !session?.user?.id) {
      router.push(`/cadastro?tipo=empresa&plano=${plan}`);
      return;
    }

    if (session.user.role !== "BUSINESS") {
      setMessage("Entre com uma conta empresarial para assinar.");
      return;
    }

    setLoadingPlan(plan);
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; url?: string };
    setLoadingPlan(null);

    if (!response.ok || !payload.url) {
      setMessage(payload.error ?? "Nao foi possivel iniciar o checkout.");
      return;
    }

    window.location.assign(payload.url);
  }

  return (
    <section id="planos" className={compact ? "grid gap-3" : "grid gap-4"}>
      <div>
        <p className="text-xs font-bold uppercase text-emerald-700">Assinatura empresarial</p>
        <h2 className={compact ? "text-xl font-black text-slate-950" : "text-2xl font-black text-slate-950"}>
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {companyPlanList.map(plan => {
          const sponsored = plan.id === "PATROCINADO";
          const Icon = sponsored ? Star : ShieldCheck;

          return (
            <article
              key={plan.id}
              className={`rounded-lg border bg-white p-4 shadow-sm ${
                sponsored ? "border-emerald-500 ring-1 ring-emerald-100" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black uppercase ${
                      sponsored ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <Icon size={14} />
                    {plan.name}
                  </span>
                  <p className="mt-3 text-2xl font-black text-slate-950">{formatPlanPrice(plan.priceCents)}</p>
                  <p className="text-xs font-semibold text-slate-500">por mes</p>
                </div>
                {plan.trialDays > 0 ? (
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                    2 meses gratis
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">{plan.description}</p>
              <ul className="mt-3 grid gap-2 text-sm font-semibold text-slate-700">
                {plan.benefits.map(benefit => (
                  <li key={benefit} className="flex gap-2">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-700" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handlePlanClick(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-3 font-bold text-white transition disabled:opacity-60 ${
                  sponsored ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-950 hover:bg-slate-800"
                }`}
              >
                {loadingPlan === plan.id ? <Loader2 className="animate-spin" size={18} /> : null}
                {enableCheckout ? "Assinar plano" : "Escolher plano"}
              </button>
            </article>
          );
        })}
      </div>

      {message ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{message}</p> : null}
    </section>
  );
}
