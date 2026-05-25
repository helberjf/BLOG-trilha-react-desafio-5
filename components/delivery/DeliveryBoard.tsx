"use client";

import { Bike, Crown, LocateFixed, Plus, Radar, ShieldCheck, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { DeliveryRequestCard } from "@/components/delivery/DeliveryRequestCard";
import { DeliveryRequestForm } from "@/components/delivery/DeliveryRequestForm";
import { NewRequestDialog } from "@/components/delivery/NewRequestDialog";
import { distanceInKm, resolveNearestCity, supportedCities, type Coordinates } from "@/lib/delivery/location";
import { canCreateDeliveryRequest } from "@/lib/delivery/permissions";
import {
  type DeliveryRequestSummary,
  type DeliverySort,
  deliverySortOptions
} from "@/lib/delivery/shared";

type DeliveryBoardProps = {
  city: string;
  requests: DeliveryRequestSummary[];
  sort: DeliverySort;
  initialLat?: number;
  initialLng?: number;
  initialRadius?: number;
};

const radiusPresets = [3, 5, 10, 20, 50];

export function DeliveryBoard({ city, requests, sort, initialLat, initialLng, initialRadius }: DeliveryBoardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"pedidos" | "novo">("pedidos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [radiusKm, setRadiusKm] = useState(initialRadius && initialRadius > 0 ? initialRadius : 3);
  const [courierLocation, setCourierLocation] = useState<Coordinates | null>(
    initialLat !== undefined && initialLng !== undefined ? { latitude: initialLat, longitude: initialLng } : null
  );
  const [isLocatingOffers, setIsLocatingOffers] = useState(false);
  const [radiusError, setRadiusError] = useState<string | null>(null);
  const canPost = canCreateDeliveryRequest(session?.user);
  const currentBoardUrl = `/pedidos?cidade=${encodeURIComponent(city)}`;

  function buildCityUrl(targetCity: string) {
    const params = new URLSearchParams({ cidade: targetCity, ordenar: sort });
    if (courierLocation) {
      params.set("lat", courierLocation.latitude.toFixed(6));
      params.set("lng", courierLocation.longitude.toFixed(6));
      params.set("raio", String(radiusKm));
    }
    return `/pedidos?${params.toString()}`;
  }
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(currentBoardUrl)}`;
  const requestsWithDistance = useMemo(
    () =>
      requests.map(request => ({
        request,
        distanceKm:
          courierLocation && request.pickupCoordinates
            ? distanceInKm(courierLocation, request.pickupCoordinates)
            : null
      })),
    [courierLocation, requests]
  );
  const visibleRequests = courierLocation
    ? requestsWithDistance
        .filter(item => item.distanceKm !== null && item.distanceKm <= radiusKm)
        .map(item => item.request)
    : requests;
  const radiusSummary = courierLocation
    ? `${visibleRequests.length} ${visibleRequests.length === 1 ? "oferta" : "ofertas"} em ate ${radiusKm} km da sua localizacao em ${city}`
    : "Ative sua localizacao para filtrar ofertas pela retirada perto de voce.";

  function handleUseOfferLocation() {
    if (!navigator.geolocation) {
      setRadiusError("Localizacao indisponivel neste navegador.");
      return;
    }

    setIsLocatingOffers(true);
    setRadiusError(null);

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const coordinates = { latitude: lat, longitude: lng };
        const nearest = resolveNearestCity(coordinates);

        setCourierLocation(coordinates);
        setIsLocatingOffers(false);

        if (nearest.city.toLowerCase() !== city.toLowerCase()) {
          const params = new URLSearchParams({
            cidade: nearest.city,
            lat: lat.toFixed(6),
            lng: lng.toFixed(6),
            raio: String(radiusKm),
            ordenar: sort
          });
          router.push(`/pedidos?${params.toString()}`);
        }
      },
      () => {
        setRadiusError("Nao foi possivel acessar sua localizacao. Confira a permissao do navegador.");
        setIsLocatingOffers(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000
      }
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-5 py-6 sm:px-8">
      <header className="mb-8 flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/" className="mb-3 inline-flex items-center gap-2 text-lg font-black text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Bike size={19} />
            </span>
            EntregaApp
          </Link>
          <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">Pedidos em {city}</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Compare valor, tempo estimado e reputacao antes de chamar a empresa no WhatsApp.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {supportedCities.map(c => (
              <Link
                key={c}
                href={buildCityUrl(c)}
                className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
                  c === city
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canPost ? (
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              Novo pedido
            </button>
          ) : (
            <Link
              href={loginUrl}
              className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-slate-800"
            >
              <ShieldCheck size={18} />
              Entrar para publicar
            </Link>
          )}
        </div>
      </header>

      <section className="mb-5 hidden gap-4 sm:grid lg:grid-cols-[0.86fr_1.14fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp size={20} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700">Mercado local</p>
              <h2 className="text-xl font-black text-slate-950">Pedidos comerciais em tempo real</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Empresas ganham uma vitrine por cidade; entregadores filtram oportunidades mais rentaveis.
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-slate-50 p-3">
              <strong className="block text-lg text-slate-950">{requests.length}</strong>
              <span className="text-xs font-semibold text-slate-500">abertos</span>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <strong className="block text-lg text-slate-950">4.8</strong>
              <span className="text-xs font-semibold text-slate-500">media</span>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <strong className="block text-lg text-slate-950">35min</strong>
              <span className="text-xs font-semibold text-slate-500">rota</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Crown size={20} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-amber-700">Plano comercial</p>
              <h2 className="text-xl font-black text-slate-950">Destaque para empresas recorrentes</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A monetizacao pode priorizar pedidos destacados, selo verificado e relatorios de resposta por cidade.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-slate-700">
            <span className="rounded-full bg-slate-100 px-3 py-1">Pedido destacado</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">CNPJ verificado</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Ranking por avaliacao</span>
          </div>
        </div>
      </section>

      <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Radar size={20} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700">Raio de ofertas</p>
              <h2 className="text-xl font-black text-slate-950">Busca por retirada perto do entregador</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{radiusSummary}</p>
              {radiusError ? <p className="mt-2 text-sm font-semibold text-red-600">{radiusError}</p> : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Raio de busca (km)
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={radiusKm}
                  onChange={event => {
                    const value = parseInt(event.target.value);
                    if (!isNaN(value) && value > 0) setRadiusKm(value);
                  }}
                  className="min-h-11 w-24 rounded-md border border-slate-200 bg-white px-3 outline-none focus:border-emerald-500"
                />
                <div className="flex flex-wrap gap-1">
                  {radiusPresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRadiusKm(preset)}
                      className={`rounded-full border px-2 py-0.5 text-xs font-bold transition ${
                        radiusKm === preset
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-400"
                      }`}
                    >
                      {preset} km
                    </button>
                  ))}
                </div>
              </div>
            </label>
            <button
              type="button"
              onClick={handleUseOfferLocation}
              disabled={isLocatingOffers}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <LocateFixed size={18} />
              {isLocatingOffers ? "Buscando..." : "Usar minha localizacao para ofertas"}
            </button>
          </div>
        </div>
      </section>

      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex rounded-md bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab("pedidos")}
            className={`rounded-md px-4 py-2 text-sm font-bold ${
              tab === "pedidos" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
            }`}
          >
            Pedidos
          </button>
          <button
            type="button"
            onClick={() => setTab("novo")}
            className={`rounded-md px-4 py-2 text-sm font-bold ${
              tab === "novo" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
            }`}
          >
            Novo pedido
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {deliverySortOptions.map(option => (
            <Link
              key={option.value}
              href={`/pedidos?cidade=${encodeURIComponent(city)}&ordenar=${option.value}`}
              className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
                sort === option.value
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {tab === "novo" ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {canPost ? (
            <DeliveryRequestForm defaultCity={city} />
          ) : (
            <div className="rounded-lg bg-slate-50 p-5 text-center sm:p-8">
              <h2 className="text-2xl font-black text-slate-950">Entre como empresario para publicar</h2>
              <p className="mx-auto mt-2 max-w-lg text-slate-600">
                Apenas contas do tipo Empresario com CNPJ valido podem cadastrar uma necessidade de entrega.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link href={loginUrl} className="rounded-md bg-slate-950 px-4 py-2 font-bold text-white">
                  Entrar
                </Link>
                <Link href="/cadastro?tipo=empresa" className="rounded-md border border-slate-200 px-4 py-2 font-bold">
                  Criar conta
                </Link>
              </div>
            </div>
          )}
        </section>
      ) : visibleRequests.length > 0 ? (
        <section className="grid gap-4">
          {visibleRequests.map(request => (
            <DeliveryRequestCard key={request.id} request={request} />
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center sm:p-10">
          <h2 className="text-2xl font-black text-slate-950">Nenhuma oferta neste raio em {city}</h2>
          <p className="mt-2 text-slate-600">Aumente o raio de busca ou tente outra cidade.</p>
        </section>
      )}

      <NewRequestDialog city={city} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
