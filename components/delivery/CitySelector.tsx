"use client";

import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  LocateFixed,
  MapPin,
  MessageCircle,
  Star,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { resolveNearestCity } from "@/lib/delivery/location";

const cities = ["Sao Paulo", "Campinas", "Rio de Janeiro", "Belo Horizonte", "Curitiba"];
const highlights = [
  {
    icon: BriefcaseBusiness,
    title: "CNPJ verificado",
    description: "Publique corridas avulsas, urgentes ou recorrentes sem depender de grupo aberto."
  },
  {
    icon: Users,
    title: "Motoboys por cidade",
    description: "Entregadores encontram oportunidades por valor, tempo, avaliacao e bairro."
  },
  {
    icon: MessageCircle,
    title: "Fechamento direto",
    description: "O contato abre no WhatsApp de quem publicou para acelerar a negociacao."
  }
];

export function CitySelector() {
  const router = useRouter();
  const [city, setCity] = useState(cities[0]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/pedidos?cidade=${encodeURIComponent(city)}`);
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationStatus(null);
      setLocationError("Localizacao indisponivel neste navegador. Escolha a cidade manualmente.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    setLocationStatus("Solicitando localizacao gratuita do navegador...");

    navigator.geolocation.getCurrentPosition(
      position => {
        const nearestCity = resolveNearestCity({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });

        setCity(nearestCity.city);
        setLocationStatus(`Localizacao detectada: ${nearestCity.city}`);
        setIsLocating(false);
      },
      () => {
        setLocationStatus(null);
        setLocationError("Nao foi possivel acessar sua localizacao. Escolha a cidade manualmente.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000
      }
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8">
      <nav className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2 text-lg font-black tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
            <MapPin size={19} />
          </span>
          EntregaApp
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

      <section className="grid flex-1 items-center gap-6 py-6 sm:gap-10 sm:py-10 lg:grid-cols-[1.04fr_0.96fr]">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase text-emerald-700 shadow-sm">
            <BadgeCheck size={15} />
            Marketplace local de entregas
          </p>
          <h1 className="max-w-3xl text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-6xl">
            Publique entregas e encontre motoboys disponiveis
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
            Uma vitrine comercial para empresas divulgarem necessidades de entrega e para
            entregadores escolherem pedidos com valor, horario, local de retirada e rota claros.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/cadastro?tipo=empresa"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 font-bold text-white transition hover:bg-emerald-700"
            >
              Sou empresa
              <ArrowRight size={17} />
            </a>
            <a
              href="/cadastro?tipo=entregador"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-950 transition hover:border-slate-300"
            >
              Sou entregador
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid max-w-xl gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[1fr_auto]"
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
              type="button"
              onClick={handleUseLocation}
              disabled={isLocating}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-950 transition hover:border-emerald-300 disabled:opacity-60 sm:col-span-2"
            >
              <LocateFixed size={18} />
              {isLocating ? "Buscando..." : "Usar minha localizacao"}
            </button>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 font-bold text-white transition hover:bg-emerald-700 sm:col-start-2 sm:row-start-1"
            >
              Ver pedidos
              <ArrowRight size={18} />
            </button>
          </form>
          {locationStatus ? (
            <p className="mt-3 inline-flex rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              {locationStatus}
            </p>
          ) : null}
          {locationError ? (
            <p className="mt-3 inline-flex rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {locationError}
            </p>
          ) : null}

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {highlights.map(item => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <Icon className="text-emerald-700" size={20} />
                  <h2 className="mt-3 text-sm font-black text-slate-950">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:block">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-500">Agora em Sao Paulo</p>
              <h2 className="text-2xl font-black text-slate-950">Painel de oportunidades</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Pedido destacado
            </span>
          </div>
          <div className="space-y-3">
            {[
              ["Entrega expressa de marmitas", "R$ 28,00", "35 min"],
              ["Documento urgente no centro", "R$ 42,00", "50 min"],
              ["Coleta de peca automotiva", "R$ 35,00", "40 min"]
            ].map(([title, value, time]) => (
              <div key={title} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-slate-950">{title}</p>
                  <Star className="shrink-0 fill-amber-300 text-amber-400" size={16} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={15} />
                    {time}
                  </span>
                  <strong className="text-emerald-700">{value}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
            <div>
              <strong className="block text-lg text-slate-950">24</strong>
              <span className="text-xs font-semibold text-slate-500">pedidos hoje</span>
            </div>
            <div>
              <strong className="block text-lg text-slate-950">4.8</strong>
              <span className="text-xs font-semibold text-slate-500">avaliacao media</span>
            </div>
            <div>
              <strong className="block text-lg text-slate-950">12min</strong>
              <span className="text-xs font-semibold text-slate-500">1a resposta</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
