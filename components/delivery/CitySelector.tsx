"use client";

import { ArrowRight, Bike, Clock3, LocateFixed, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { resolveNearestCity, supportedCities } from "@/lib/delivery/location";

const DEFAULT_CITY = "Juiz de Fora";

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

  useEffect(() => {
    const key = "entregaapp_location_asked";
    if (typeof window !== "undefined" && !localStorage.getItem(key)) {
      localStorage.setItem(key, "1");
      handleUseLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8">
      <nav className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2 text-lg font-black tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Bike size={19} />
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

      <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.04fr_0.96fr]">
        <div>
          <h1 className="max-w-lg text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Pedidos de entrega perto de voce
          </h1>
          <p className="mt-2 text-base font-semibold text-emerald-700">
            O jeito mais simples de combinar uma entrega sem taxas escondidas.
          </p>
          <p className="mt-1 text-sm text-slate-500">Escolha sua cidade e veja oportunidades disponíveis agora.</p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid max-w-lg gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[1fr_auto]"
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
              {supportedCities.map(option => (
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

          <p className="mt-6 text-sm text-slate-500">
            Quer publicar pedidos?{" "}
            <a href="/cadastro?tipo=empresa" className="font-bold text-emerald-700 hover:underline">
              Criar conta empresarial
            </a>
            {" · "}
            <a href="/cadastro?tipo=entregador" className="font-bold text-slate-700 hover:underline">
              Cadastrar como entregador
            </a>
          </p>
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
