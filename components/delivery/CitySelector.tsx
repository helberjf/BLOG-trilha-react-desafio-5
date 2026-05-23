"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const cities = ["Sao Paulo", "Campinas", "Rio de Janeiro", "Belo Horizonte", "Curitiba"];

export function CitySelector() {
  const router = useRouter();
  const [city, setCity] = useState(cities[0]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/pedidos?cidade=${encodeURIComponent(city)}`);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
      <nav className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2 text-lg font-black tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <MapPin size={19} />
          </span>
          Entregador
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <a href="/login" className="rounded-md px-3 py-2 hover:bg-white">
            Entrar
          </a>
          <a href="/cadastro" className="rounded-md bg-slate-950 px-3 py-2 text-white">
            Criar conta
          </a>
        </div>
      </nav>

      <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 shadow-sm">
            Pedidos locais para motoboys
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
            Entregador
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Encontre entregas por cidade, compare valor e tempo estimado, e chame
            quem publicou o pedido direto no WhatsApp.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex max-w-xl flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row"
          >
            <label className="sr-only" htmlFor="city">
              Cidade
            </label>
            <select
              id="city"
              value={city}
              onChange={event => setCity(event.target.value)}
              className="min-h-12 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-900 outline-none focus:border-emerald-500"
            >
              {cities.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 font-bold text-white transition hover:bg-emerald-700"
            >
              Ver pedidos
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">Agora em Sao Paulo</p>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              2 abertos
            </span>
          </div>
          <div className="space-y-3">
            {[
              ["Entrega expressa de marmitas", "R$ 28,00", "35 min"],
              ["Documento urgente no centro", "R$ 42,00", "50 min"],
              ["Coleta de peca automotiva", "R$ 35,00", "40 min"]
            ].map(([title, value, time]) => (
              <div key={title} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-slate-950">{title}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span>{time}</span>
                  <strong className="text-emerald-700">{value}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
