"use client";

import { CheckCircle2, MessageCircle, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { centsToCurrency, formatWhatsAppUrl } from "@/lib/delivery/format";
import type { DeliveryRequestSummary } from "@/lib/delivery/shared";

type ManagedDeliveryRequestsProps = {
  requests: DeliveryRequestSummary[];
};

export function ManagedDeliveryRequests({ requests }: ManagedDeliveryRequestsProps) {
  const router = useRouter();
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (requests.length === 0) return null;

  async function postAction(path: string, body?: unknown) {
    const response = await fetch(path, {
      method: "POST",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "Nao foi possivel atualizar esta entrega.");
    }
  }

  async function handleComplete(requestId: string) {
    setSubmittingId(requestId);
    setError(null);

    try {
      await postAction(`/api/delivery-requests/${requestId}/complete`);
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Nao foi possivel concluir a entrega.");
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleReview(event: FormEvent<HTMLFormElement>, requestId: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setSubmittingId(requestId);
    setError(null);

    try {
      await postAction(`/api/delivery-requests/${requestId}/review`, {
        rating: formData.get("rating"),
        comment: formData.get("comment")
      });
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Nao foi possivel avaliar o entregador.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <section aria-label="Aceites da empresa" className="mb-4 grid min-w-0 gap-3">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-black uppercase text-emerald-700">Aceites da empresa</p>
        <h2 className="mt-1 text-xl font-black text-slate-950">Aceites da empresa</h2>
        <p className="mt-1 text-sm leading-6 text-emerald-900">
          O app somente conecta empresa e entregador: o aceite fica registrado aqui, mas o combinado da entrega
          continua entre as partes.
        </p>
        {error ? <p className="mt-2 text-sm font-semibold text-red-700">{error}</p> : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {requests.map(request => {
          const courierName = request.acceptedBy?.name ?? "Entregador";
          const isSubmitting = submittingId === request.id;
          const hasReview = Boolean(request.review);
          const isDone = request.status === "DONE";
          const whatsappMessage = `Ola, vamos falar sobre a entrega aceita: ${request.title}`;

          return (
            <article key={request.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-600">
                    {isDone ? "Concluida" : "Aceita"}
                  </span>
                  <h3 className="mt-2 text-base font-black text-slate-950">{request.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {courierName} aceitou {centsToCurrency(request.deliveryValueCents)} para {request.city}.
                  </p>
                </div>

                {request.acceptedBy?.whatsapp ? (
                  <a
                    href={formatWhatsAppUrl(request.acceptedBy.whatsapp, whatsappMessage)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Chamar ${courierName} no WhatsApp`}
                    className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                  </a>
                ) : null}
              </div>

              {!isDone ? (
                <button
                  type="button"
                  onClick={() => handleComplete(request.id)}
                  disabled={isSubmitting}
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
                >
                  <CheckCircle2 size={16} />
                  {isSubmitting ? "Concluindo..." : "Marcar como concluida"}
                </button>
              ) : hasReview ? (
                <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
                  <Star size={16} />
                  Avaliado com {request.review?.rating}/5
                </p>
              ) : (
                <form onSubmit={event => handleReview(event, request.id)} className="mt-4 grid gap-3">
                  <label className="grid gap-1 text-sm font-bold text-slate-700">
                    Nota do entregador
                    <select
                      name="rating"
                      defaultValue="5"
                      className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-500"
                    >
                      <option value="5">5 - Excelente</option>
                      <option value="4">4 - Bom</option>
                      <option value="3">3 - Regular</option>
                      <option value="2">2 - Ruim</option>
                      <option value="1">1 - Muito ruim</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-slate-700">
                    Comentario
                    <textarea
                      name="comment"
                      rows={3}
                      maxLength={280}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      placeholder="Como foi a entrega?"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Star size={16} />
                    {isSubmitting ? "Avaliando..." : "Avaliar entregador"}
                  </button>
                </form>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
