"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LocateFixed, Package, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  type DeliveryRequestFormInput,
  type DeliveryRequestInput,
  deliveryRequestSchema
} from "@/lib/delivery/validators";

type DeliveryRequestFormProps = {
  defaultCity: string;
  onSuccess?: () => void;
};

const inputClass =
  "min-h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500";

export function DeliveryRequestForm({ defaultCity, onSuccess }: DeliveryRequestFormProps) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [isLocatingPickup, setIsLocatingPickup] = useState(false);
  const [pickupLocationStatus, setPickupLocationStatus] = useState<string | null>(null);
  const [pickupLocationError, setPickupLocationError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<DeliveryRequestFormInput, unknown, DeliveryRequestInput>({
    resolver: zodResolver(deliveryRequestSchema),
    defaultValues: {
      city: defaultCity,
      estimatedMinutes: 30
    }
  });

  function handleUsePickupLocation() {
    if (!navigator.geolocation) {
      setPickupLocationStatus(null);
      setPickupLocationError("Localizacao indisponivel neste navegador.");
      return;
    }

    setIsLocatingPickup(true);
    setPickupLocationError(null);
    setPickupLocationStatus("Solicitando localizacao da retirada...");

    navigator.geolocation.getCurrentPosition(
      position => {
        setValue("pickupLatitude", position.coords.latitude, { shouldDirty: true, shouldValidate: true });
        setValue("pickupLongitude", position.coords.longitude, { shouldDirty: true, shouldValidate: true });
        setPickupLocationStatus("Localizacao da retirada salva para busca por raio.");
        setIsLocatingPickup(false);
      },
      () => {
        setPickupLocationStatus(null);
        setPickupLocationError("Nao foi possivel acessar a localizacao da retirada.");
        setIsLocatingPickup(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000
      }
    );
  }

  async function onSubmit(data: DeliveryRequestInput) {
    setServerMessage(null);
    setSuccess(false);

    const response = await fetch("/api/delivery-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setServerMessage(payload.error ?? "Nao foi possivel publicar o pedido.");
      return;
    }

    setSuccess(true);
    setPickupLocationStatus(null);
    setPickupLocationError(null);
    reset({ city: defaultCity, estimatedMinutes: 30 });
    router.refresh();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Titulo" error={errors.title?.message}>
          <input {...register("title")} className={inputClass} placeholder="Ex: Entrega expressa" />
        </Field>
        <Field label="Cidade" error={errors.city?.message}>
          <input {...register("city")} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Local de recebimento" error={errors.pickupAddress?.message}>
          <input {...register("pickupAddress")} className={inputClass} placeholder="Endereco de retirada" />
        </Field>
        <Field label="Local de entrega" error={errors.dropoffAddress?.message}>
          <input {...register("dropoffAddress")} className={inputClass} placeholder="Endereco de destino" />
        </Field>
      </div>

      <input type="hidden" {...register("pickupLatitude")} />
      <input type="hidden" {...register("pickupLongitude")} />
      <input type="hidden" {...register("dropoffLatitude")} />
      <input type="hidden" {...register("dropoffLongitude")} />

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-slate-950">Localizacao da retirada</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Salve a posicao atual para entregadores encontrarem este pedido por raio.
            </p>
          </div>
          <button
            type="button"
            onClick={handleUsePickupLocation}
            disabled={isLocatingPickup}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 transition hover:border-emerald-300 disabled:opacity-60"
          >
            <LocateFixed size={16} />
            {isLocatingPickup ? "Buscando..." : "Usar localizacao da retirada"}
          </button>
        </div>
        {pickupLocationStatus ? (
          <p className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {pickupLocationStatus}
          </p>
        ) : null}
        {pickupLocationError ? (
          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {pickupLocationError}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Data" error={errors.scheduledDate?.message}>
          <input type="date" {...register("scheduledDate")} className={inputClass} />
        </Field>
        <Field label="Horario" error={errors.scheduledTime?.message}>
          <input type="time" {...register("scheduledTime")} className={inputClass} />
        </Field>
        <Field label="Valor" error={errors.deliveryValue?.message}>
          <input {...register("deliveryValue")} className={inputClass} placeholder="35,00" />
        </Field>
        <Field label="Tempo" error={errors.estimatedMinutes?.message}>
          <input
            type="number"
            min={1}
            {...register("estimatedMinutes", { valueAsNumber: true })}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="WhatsApp de contato" error={errors.posterWhatsapp?.message}>
        <input {...register("posterWhatsapp")} className={inputClass} placeholder="(11) 99999-8888" />
      </Field>

      <Field label="Descricao" error={errors.description?.message}>
        <textarea
          {...register("description")}
          className="min-h-24 rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500"
          placeholder="Detalhe volume, observacoes e comprovante esperado."
        />
      </Field>

      <div className="rounded-lg border border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => setShowBox(v => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700"
        >
          <span className="flex items-center gap-2">
            <Package size={16} className="text-slate-500" />
            Dimensoes da embalagem
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-500">opcional</span>
          </span>
          <span className="text-slate-400">{showBox ? "−" : "+"}</span>
        </button>

        {showBox ? (
          <div className="grid grid-cols-2 gap-3 border-t border-slate-200 p-4 sm:grid-cols-4">
            <Field label="Largura (cm)" error={errors.boxWidthCm?.message}>
              <input
                type="number"
                min="0.1"
                step="0.1"
                {...register("boxWidthCm")}
                className={inputClass}
                placeholder="Ex: 20"
              />
            </Field>
            <Field label="Altura (cm)" error={errors.boxHeightCm?.message}>
              <input
                type="number"
                min="0.1"
                step="0.1"
                {...register("boxHeightCm")}
                className={inputClass}
                placeholder="Ex: 15"
              />
            </Field>
            <Field label="Comprimento (cm)" error={errors.boxLengthCm?.message}>
              <input
                type="number"
                min="0.1"
                step="0.1"
                {...register("boxLengthCm")}
                className={inputClass}
                placeholder="Ex: 30"
              />
            </Field>
            <Field label="Peso (kg)" error={errors.boxWeightKg?.message}>
              <input
                type="number"
                min="0.01"
                step="0.01"
                {...register("boxWeightKg")}
                className={inputClass}
                placeholder="Ex: 2.5"
              />
            </Field>
          </div>
        ) : null}
      </div>

      {serverMessage ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverMessage}</p> : null}
      {success ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Pedido publicado.</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        Publicar pedido
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
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
