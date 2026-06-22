"use client";

import {
  ArrowRight,
  BadgeCheck,
  Bike,
  BriefcaseBusiness,
  Clock3,
  LocateFixed,
  MapPinned,
  MessageCircle,
  Navigation,
  WalletCards,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PricingPlans } from "@/components/billing/PricingPlans";
import { resolveNearestCity, supportedCities } from "@/lib/delivery/location";

const DEFAULT_CITY = "Juiz de Fora";

const audienceCards = [
  {
    title: "Empresa",
    description: "Publique pedidos com CNPJ validado, registre o aceite e combine os detalhes com o entregador.",
    href: "/cadastro?tipo=empresa",
    linkLabel: "Criar conta empresa",
    icon: BriefcaseBusiness,
    tone: "emerald"
  },
  {
    title: "Entregador",
    description: "Compare valor, horario, rota e distancia antes de aceitar uma entrega e falar com a empresa.",
    href: "/cadastro?tipo=entregador",
    linkLabel: "Criar conta entregador",
    icon: WalletCards,
    tone: "sky"
  }
];

const liveRequests = [
  ["Entrega expressa de marmitas", "Sao Paulo", "R$ 28,00", "35 min", "Patrocinado"],
  ["Documento urgente no centro", "Sao Paulo", "R$ 42,00", "50 min", "Verificado"],
  ["Coleta de peca automotiva", "Campinas", "R$ 35,00", "40 min", "Novo"]
];

const homeStats = [
  ["2 min", "para publicar"],
  ["24h", "propostas visiveis"],
  ["WhatsApp", "contato direto"]
];

const deliveryFormExample = [
  ["Titulo do pedido", "Entrega expressa de marmitas"],
  ["Local de retirada", "Rua Vergueiro, 1200 - Paraiso"],
  ["Local de entrega", "Av. Paulista, 900 - Bela Vista"],
  ["Data e horario", "Amanha, 11:30"],
  ["Valor da entrega", "R$ 28,00"],
  ["WhatsApp de contato", "(11) 98888-7777"]
];

export function CitySelector() {
  const router = useRouter();
  const [city, setCity] = useState(DEFAULT_CITY);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/pedidos?cidade=${encodeURIComponent(city)}`);
  }

  const handleUseLocation = useCallback(() => {
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
  }, []);

  useEffect(() => {
    const key = "entregaapp_location_asked";
    if (typeof window !== "undefined" && !localStorage.getItem(key)) {
      localStorage.setItem(key, "1");
      const timeout = window.setTimeout(handleUseLocation, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [handleUseLocation]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f8fb] text-slate-950">
      <div className="mx-auto flex min-w-0 w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-lg font-black tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Bike size={19} />
            </span>
            EntregaApp
          </div>
          <div className="grid min-w-0 w-full grid-cols-2 gap-2 text-center text-sm font-bold sm:flex sm:w-auto sm:items-center">
            <a href="/login" className="min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:border-slate-300">
              Entrar
            </a>
            <a href="/cadastro" className="min-w-0 whitespace-nowrap rounded-md bg-slate-950 px-3 py-2 text-white hover:bg-slate-800">
              Criar conta
            </a>
          </div>
        </nav>

        <section className="grid gap-6 py-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.75fr)] lg:items-start lg:py-10">
          <div className="grid min-w-0 gap-5">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-black uppercase text-emerald-700">
                <Navigation size={14} />
                Marketplace local de entregas
              </span>
              <h1 className="mt-4 break-words text-3xl font-black leading-tight tracking-normal sm:text-4xl lg:text-5xl">
                Entregas locais por cidade
              </h1>
              <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-slate-700">
                Escolha a cidade para ver pedidos abertos, comparar rotas e falar direto com a empresa. O
                EntregaApp conecta empresas e entregadores locais; o combinado da entrega continua entre as partes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid min-w-0 gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="sr-only" htmlFor="city">
                  Cidade
                </label>
                <select
                  id="city"
                  value={city}
                  onChange={event => setCity(event.target.value)}
                  className="min-h-12 min-w-0 max-w-full rounded-md border border-slate-200 bg-slate-50 px-3 font-semibold text-slate-900 outline-none focus:border-emerald-500"
                >
                  {supportedCities.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 font-black text-white transition hover:bg-emerald-700"
                >
                  Ver pedidos
                  <ArrowRight size={18} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={isLocating}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-800 transition hover:border-emerald-300 disabled:opacity-60"
              >
                <LocateFixed size={18} />
                {isLocating ? "Buscando..." : "Usar minha localizacao"}
              </button>
            </form>

            {locationStatus ? (
              <p className="inline-flex w-fit rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                {locationStatus}
              </p>
            ) : null}
            {locationError ? (
              <p className="inline-flex w-fit rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {locationError}
              </p>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              {homeStats.map(([value, label]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-3">
                  <strong className="block text-lg text-slate-950">{value}</strong>
                  <span className="text-xs font-bold uppercase text-slate-500">{label}</span>
                </div>
              ))}
            </div>

            <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-3">
                <p className="text-xs font-black uppercase text-emerald-700">Formulario mobile-first</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Exemplo de pedido de entrega</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  A empresa informa retirada, entrega, valor e WhatsApp antes de receber aceites.
                </p>
              </div>
              <form aria-label="Exemplo de pedido de entrega" className="grid gap-2">
                {deliveryFormExample.map(([label, value]) => (
                  <label key={label} className="grid gap-1 text-sm font-bold text-slate-700">
                    {label}
                    <input
                      readOnly
                      value={value}
                      className="min-h-10 min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900"
                    />
                  </label>
                ))}
                <button
                  type="button"
                  disabled
                  className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 font-black text-white opacity-80"
                >
                  Publicar exemplo
                  <ArrowRight size={18} />
                </button>
              </form>
            </section>
          </div>

          <aside className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-slate-500">Pedidos disponiveis agora</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Pedidos disponiveis agora</h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black uppercase text-amber-700">
                <Zap size={14} />
                Destaques
              </span>
            </div>

            <div className="mt-4 grid gap-2">
              {liveRequests.map(([title, cityName, value, time, badge]) => (
                <div key={title} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase text-emerald-700">{cityName}</span>
                      <p className="truncate text-sm font-black text-slate-950">{title}</p>
                    </div>
                    <strong className="shrink-0 text-sm text-emerald-700">{value}</strong>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={14} />
                      {time}
                    </span>
                    <span className={badge === "Patrocinado" ? "text-amber-700" : "text-slate-500"}>{badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="grid min-w-0 gap-4 border-t border-slate-200 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="grid gap-3">
            {audienceCards.map(card => {
              const Icon = card.icon;
              const toneClass = card.tone === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700";

              return (
                <article key={card.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-950">{card.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{card.description}</p>
                      <a href={card.href} className="mt-3 inline-flex items-center gap-1 text-sm font-black text-emerald-700">
                        {card.linkLabel}
                        <ArrowRight size={15} />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="grid gap-4">
            <PricingPlans compact />
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
              {[
                ["Empresa publica", "CNPJ, retirada, entrega, valor e WhatsApp ficam claros.", MapPinned],
                ["Entregador aceita", "O app registra o aceite e remove a proposta da vitrine.", BadgeCheck],
                ["Contato direto", "WhatsApp apoia o combinado entre empresa e entregador.", MessageCircle]
              ].map(([title, description, Icon]) => (
                <div key={title as string} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-50 text-emerald-700">
                    <Icon size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-950">{title as string}</h3>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{description as string}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
