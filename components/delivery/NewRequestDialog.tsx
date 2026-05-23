"use client";

import { X } from "lucide-react";

import { DeliveryRequestForm } from "@/components/delivery/DeliveryRequestForm";

type NewRequestDialogProps = {
  city: string;
  open: boolean;
  onClose: () => void;
};

export function NewRequestDialog({ city, open, onClose }: NewRequestDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Novo pedido</p>
            <h2 className="text-2xl font-black text-slate-950">Publique uma entrega</h2>
          </div>
          <button
            type="button"
            aria-label="Fechar modal"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <X size={20} />
          </button>
        </div>
        <DeliveryRequestForm defaultCity={city} onSuccess={onClose} />
      </section>
    </div>
  );
}
