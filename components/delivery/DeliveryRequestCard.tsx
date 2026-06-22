"use client";

import { BadgeCheck, CalendarDays, Clock, MapPin, MessageCircle, Route, ShieldMinus, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { centsToCurrency, formatWhatsAppUrl } from "@/lib/delivery/format";
import { formatMapsRouteUrl } from "@/lib/delivery/location";
import type { DeliveryRequestSummary } from "@/lib/delivery/shared";

type DeliveryRequestCardProps = {
  loginUrl?: string;
  request: DeliveryRequestSummary;
};

export function DeliveryRequestCard({ loginUrl = "/login?callbackUrl=/pedidos", request }: DeliveryRequestCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState(request.status ?? "OPEN");
  const message = `Ola, tenho interesse na entrega: ${request.title}`;
  const mapsRouteUrl = formatMapsRouteUrl({
    pickupAddress: request.pickupAddress,
    dropoffAddress: request.dropoffAddress,
    city: request.city
  });
  const pickupDistance =
    typeof request.pickupDistanceKm === "number"
      ? request.pickupDistanceKm.toFixed(1).replace(/\.0$/, "")
      : null;
  const canAccept = session?.user?.role === "COURIER" && localStatus === "OPEN";
  const shouldInviteLogin = !session?.user && localStatus === "OPEN";

  async function handleAccept() {
    setIsAccepting(true);
    setAcceptError(null);

    try {
      const response = await fetch(`/api/delivery-requests/${request.id}/accept`, { method: "POST" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setAcceptError(payload?.error ?? "Nao foi possivel aceitar esta entrega.");
        return;
      }

      setLocalStatus("TAKEN");
      router.refresh();
    } finally {
      setIsAccepting(false);
    }
  }

  return (
    <article
      aria-label={`Pedido: ${request.title}`}
      className={`relative min-w-0 max-w-full overflow-hidden rounded-lg border bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md ${
        request.isSponsored ? "border-emerald-500 ring-1 ring-emerald-100" : "border-slate-200"
      }`}
    >
      {request.isSponsored ? <div className="h-1 bg-emerald-500" /> : null}
      <div className="grid gap-3 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  request.isSponsored ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                <Zap size={11} />
                {request.isSponsored ? "Patrocinado" : "Plano empresa"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                <BadgeCheck size={11} />
                Empresa verificada
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                <ShieldMinus size={11} />
                Sem avaliacoes
              </span>
            </div>

            <p className="mt-2 text-[10px] font-black uppercase text-emerald-700">{request.city}</p>
            <h2 className="mt-0.5 text-lg font-black leading-snug text-slate-950">{request.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{request.description}</p>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 rounded-md bg-emerald-50 px-3 py-2 sm:block sm:min-w-28 sm:text-right">
            <p className="text-xs font-bold text-emerald-700">Valor</p>
            <p className="text-xl font-black text-emerald-800">{centsToCurrency(request.deliveryValueCents)}</p>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <div className="flex min-w-0 gap-2 rounded-md bg-slate-50 px-3 py-2">
            <MapPin className="mt-0.5 shrink-0 text-slate-400" size={14} />
            <span className="min-w-0">
              <strong className="block text-slate-950">Retirada</strong>
              <span className="break-words">{request.pickupAddress}</span>
            </span>
          </div>
          <div className="flex min-w-0 gap-2 rounded-md bg-slate-50 px-3 py-2">
            <MapPin className="mt-0.5 shrink-0 text-slate-400" size={14} />
            <span className="min-w-0">
              <strong className="block text-slate-950">Entrega</strong>
              <span className="break-words">{request.dropoffAddress}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={13} />
              {request.scheduledDate} as {request.scheduledTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={13} />
              {request.estimatedMinutes} min
            </span>
            {pickupDistance ? (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <MapPin size={13} />
                {pickupDistance} km de voce
              </span>
            ) : null}
            <span className="font-black text-slate-900">{request.posterName}</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-[auto_auto] lg:ml-auto">
            {canAccept ? (
              <button
                type="button"
                onClick={handleAccept}
                disabled={isAccepting}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                <BadgeCheck size={15} />
                {isAccepting ? "Aceitando..." : "Aceitar entrega"}
              </button>
            ) : null}
            {shouldInviteLogin ? (
              <a
                href={loginUrl}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                <BadgeCheck size={15} />
                Entrar para aceitar
              </a>
            ) : null}
            <a
              href={mapsRouteUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Ver rota"
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              <Route size={15} />
              Rota
            </a>
            <a
              href={formatWhatsAppUrl(request.posterWhatsapp, message)}
              target="_blank"
              rel="noreferrer"
              aria-label="Chamar no WhatsApp"
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
          </div>
        </div>
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold leading-5 text-emerald-800">
          O app registra o aceite. Depois disso, empresa e entregador combinam os detalhes operacionais diretamente.
        </p>
        {acceptError ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-700">
            {acceptError}
          </p>
        ) : null}
      </div>
    </article>
  );
}
