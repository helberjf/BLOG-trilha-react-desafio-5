"use client";

import { Bike, Plus, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

import { DeliveryRequestCard } from "@/components/delivery/DeliveryRequestCard";
import { DeliveryRequestForm } from "@/components/delivery/DeliveryRequestForm";
import { NewRequestDialog } from "@/components/delivery/NewRequestDialog";
import { canCreateDeliveryRequest } from "@/lib/delivery/permissions";
import {
  type DeliveryRequestSummary,
  type DeliverySort,
  deliverySortOptions
} from "@/lib/delivery/shared";

type DeliveryBoardProps = {
  city: string;
  requests: DeliveryRequestSummary[];
  sort: DeliverySort;
};

export function DeliveryBoard({ city, requests, sort }: DeliveryBoardProps) {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"pedidos" | "novo">("pedidos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const canPost = canCreateDeliveryRequest(session?.user);

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-5 py-6 sm:px-8">
      <header className="mb-8 flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/" className="mb-3 inline-flex items-center gap-2 text-lg font-black text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Bike size={19} />
            </span>
            Entregador
          </Link>
          <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">Pedidos em {city}</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Compare valor, tempo estimado e reputacao antes de chamar a empresa no WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canPost ? (
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              Novo pedido
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-slate-800"
            >
              <ShieldCheck size={18} />
              Entrar para publicar
            </Link>
          )}
        </div>
      </header>

      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex rounded-md bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab("pedidos")}
            className={`rounded-md px-4 py-2 text-sm font-bold ${
              tab === "pedidos" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
            }`}
          >
            Pedidos
          </button>
          <button
            type="button"
            onClick={() => setTab("novo")}
            className={`rounded-md px-4 py-2 text-sm font-bold ${
              tab === "novo" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
            }`}
          >
            Novo pedido
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {deliverySortOptions.map(option => (
            <Link
              key={option.value}
              href={`/pedidos?cidade=${encodeURIComponent(city)}&ordenar=${option.value}`}
              className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
                sort === option.value
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {tab === "novo" ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {canPost ? (
            <DeliveryRequestForm defaultCity={city} />
          ) : (
            <div className="rounded-lg bg-slate-50 p-8 text-center">
              <h2 className="text-2xl font-black text-slate-950">Entre como empresario para publicar</h2>
              <p className="mx-auto mt-2 max-w-lg text-slate-600">
                Apenas contas do tipo Empresario com CNPJ valido podem cadastrar uma necessidade de entrega.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link href="/login" className="rounded-md bg-slate-950 px-4 py-2 font-bold text-white">
                  Entrar
                </Link>
                <Link href="/cadastro" className="rounded-md border border-slate-200 px-4 py-2 font-bold">
                  Criar conta
                </Link>
              </div>
            </div>
          )}
        </section>
      ) : requests.length > 0 ? (
        <section className="grid gap-4">
          {requests.map(request => (
            <DeliveryRequestCard key={request.id} request={request} />
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-2xl font-black text-slate-950">Nenhum pedido aberto em {city}</h2>
          <p className="mt-2 text-slate-600">Tente outra cidade ou volte mais tarde.</p>
        </section>
      )}

      <NewRequestDialog city={city} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
