import { CalendarDays, Clock, MapPin, MessageCircle, Star } from "lucide-react";

import { centsToCurrency, formatWhatsAppUrl } from "@/lib/delivery/format";
import type { DeliveryRequestSummary } from "@/lib/delivery/shared";

export function DeliveryRequestCard({ request }: { request: DeliveryRequestSummary }) {
  const message = `Ola, tenho interesse na entrega: ${request.title}`;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            {request.city}
          </p>
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

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
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
        <a
          href={formatWhatsAppUrl(request.posterWhatsapp, message)}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 font-bold text-white transition hover:bg-emerald-700"
        >
          <MessageCircle size={17} />
          Chamar no WhatsApp
        </a>
      </div>
    </article>
  );
}
