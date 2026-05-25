import { BadgeCheck, CalendarDays, Clock, MapPin, MessageCircle, Route, Star, Zap } from "lucide-react";

import { centsToCurrency, formatWhatsAppUrl } from "@/lib/delivery/format";
import { formatMapsRouteUrl } from "@/lib/delivery/location";
import type { DeliveryRequestSummary } from "@/lib/delivery/shared";

export function DeliveryRequestCard({ request }: { request: DeliveryRequestSummary }) {
  const message = `Ola, tenho interesse na entrega: ${request.title}`;
  const mapsRouteUrl = formatMapsRouteUrl({
    pickupAddress: request.pickupAddress,
    dropoffAddress: request.dropoffAddress,
    city: request.city
  });

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase text-emerald-700">
              <Zap size={14} />
              Pedido destacado
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase text-slate-700">
              <BadgeCheck size={14} />
              Empresa verificada
            </span>
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-emerald-700">{request.city}</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{request.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{request.description}</p>
        </div>
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-right">
          <p className="text-xs font-semibold text-emerald-700">Valor</p>
          <p className="text-xl font-black text-emerald-800">
            {centsToCurrency(request.deliveryValueCents)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        <div className="flex gap-2">
          <MapPin className="mt-0.5 text-slate-400" size={17} />
          <span>
            <strong className="block text-slate-950">Retirada</strong>
            {request.pickupAddress}
          </span>
        </div>
        <div className="flex gap-2">
          <MapPin className="mt-0.5 text-slate-400" size={17} />
          <span>
            <strong className="block text-slate-950">Entrega</strong>
            {request.dropoffAddress}
          </span>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={16} />
            {request.scheduledDate} as {request.scheduledTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={16} />
            {request.estimatedMinutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Star size={16} />
            {request.rating.toFixed(1)}
          </span>
          <span className="font-semibold text-slate-900">{request.posterName}</span>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <a
            href={mapsRouteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            <Route size={17} />
            Ver rota gratis
          </a>
          <a
            href={formatWhatsAppUrl(request.posterWhatsapp, message)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 font-bold text-white transition hover:bg-emerald-700 sm:ml-auto"
          >
            <MessageCircle size={17} />
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
