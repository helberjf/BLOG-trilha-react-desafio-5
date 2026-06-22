"use client";

import {
  Bike,
  ChevronLeft,
  ChevronRight,
  Crown,
  LocateFixed,
  Plus,
  ShieldCheck,
  SlidersHorizontal
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PricingPlans } from "@/components/billing/PricingPlans";
import { DeliveryRequestCard } from "@/components/delivery/DeliveryRequestCard";
import { DeliveryRequestForm } from "@/components/delivery/DeliveryRequestForm";
import { ManagedDeliveryRequests } from "@/components/delivery/ManagedDeliveryRequests";
import { NewRequestDialog } from "@/components/delivery/NewRequestDialog";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { distanceInKm, resolveNearestCity, supportedCities, type Coordinates } from "@/lib/delivery/location";
import { canCreateDeliveryRequest } from "@/lib/delivery/permissions";
import {
  DELIVERY_PAGE_SIZE,
  type DeliveryRequestSummary,
  type DeliverySort,
  deliverySortOptions
} from "@/lib/delivery/shared";

type DeliveryBoardProps = {
  city: string;
  managedRequests?: DeliveryRequestSummary[];
  requests: DeliveryRequestSummary[];
  sort: DeliverySort;
  initialLat?: number;
  initialLng?: number;
  initialRadius?: number;
};

const radiusPresets = [3, 5, 10, 20, 50];

export function DeliveryBoard({
  city,
  managedRequests = [],
  requests,
  sort,
  initialLat,
  initialLng,
  initialRadius
}: DeliveryBoardProps) {
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
  const [page, setPage] = useState(1);
  const canPost = canCreateDeliveryRequest(session?.user);
  const isBusiness = session?.user?.role === "BUSINESS";
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

  function buildSortUrl(targetSort: string) {
    const params = new URLSearchParams({ cidade: city, ordenar: targetSort });
    if (courierLocation) {
      params.set("lat", courierLocation.latitude.toFixed(6));
      params.set("lng", courierLocation.longitude.toFixed(6));
      params.set("raio", String(radiusKm));
    }
    return `/pedidos?${params.toString()}`;
  }

  function buildLocationSearchUrl(coordinates: Coordinates, targetRadiusKm: number, targetCity = city) {
    const params = new URLSearchParams({
      cidade: targetCity,
      lat: coordinates.latitude.toFixed(6),
      lng: coordinates.longitude.toFixed(6),
      raio: String(targetRadiusKm),
      ordenar: sort
    });

    return `/pedidos?${params.toString()}`;
  }

  function updateRadius(targetRadiusKm: number) {
    setRadiusKm(targetRadiusKm);
    setPage(1);

    if (courierLocation) {
      router.push(buildLocationSearchUrl(courierLocation, targetRadiusKm));
    }
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
  const sortedRequests = useMemo(() => {
    const filtered = courierLocation
      ? requestsWithDistance.filter(item => item.distanceKm !== null && item.distanceKm <= radiusKm)
      : requestsWithDistance;
    if (sort === "distancia" && courierLocation) {
      return [...filtered].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }
    return filtered;
  }, [requestsWithDistance, courierLocation, radiusKm, sort]);
  const visibleRequests = sortedRequests.map(item => item.request);
  const totalPages = Math.max(1, Math.ceil(visibleRequests.length / DELIVERY_PAGE_SIZE));
  const pagedRequests = visibleRequests.slice((page - 1) * DELIVERY_PAGE_SIZE, page * DELIVERY_PAGE_SIZE);

  const radiusSummary = courierLocation
    ? `${visibleRequests.length} ${visibleRequests.length === 1 ? "oferta" : "ofertas"} em ate ${radiusKm} km da sua localizacao em ${city}`
    : "Ative sua localizacao para filtrar ofertas pela retirada perto de voce.";
  const locationButtonLabel = isLocatingOffers ? "Buscando..." : "Usar localizacao";
  const filteredCountLabel = `${visibleRequests.length} ${
    visibleRequests.length === 1 ? "oferta filtrada" : "ofertas filtradas"
  }`;

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
        setPage(1);
        setIsLocatingOffers(false);
        router.push(buildLocationSearchUrl(coordinates, radiusKm, nearest.city));
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
    <div className="min-h-screen overflow-x-hidden bg-[#f6f8fb]">
      <div className="mx-auto min-w-0 w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Breadcrumbs
          className="mb-4"
          items={[
            { label: "Inicio", href: "/" },
            { label: "Pedidos", href: currentBoardUrl },
            { label: city }
          ]}
        />

        <header className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <Link href="/" className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
                  <Bike size={19} />
                </span>
                EntregaApp
              </Link>
              <p className="mt-4 text-xs font-black uppercase text-emerald-700">Painel de pedidos</p>
              <h1 className="mt-1 break-words text-2xl font-black leading-tight text-slate-950 sm:text-4xl">
                Pedidos em {city}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                O EntregaApp conecta empresas e entregadores locais. O aceite fica registrado no app e o combinado
                operacional continua direto entre as partes.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-3 lg:min-w-[21rem]">
              <div className="hidden rounded-lg border border-slate-200 bg-slate-50 p-3 sm:block">
                <p className="text-xs font-black uppercase text-slate-500">Rotas disponiveis</p>
                <strong className="mt-1 block text-2xl text-slate-950">{visibleRequests.length}</strong>
                <span className="text-xs font-semibold text-slate-500">filtradas agora</span>
              </div>
              <div className="hidden rounded-lg border border-slate-200 bg-slate-50 p-3 sm:block">
                <p className="text-xs font-black uppercase text-slate-500">Publicacao</p>
                <strong className="mt-1 block text-2xl text-slate-950">
                  {canPost ? "Ativa" : isBusiness ? "Plano" : "Login"}
                </strong>
                <span className="text-xs font-semibold text-slate-500">para empresas</span>
              </div>
              {canPost ? (
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 font-black text-white transition hover:bg-emerald-700"
                >
                  <Plus size={18} />
                  Novo pedido
                </button>
              ) : isBusiness ? (
                <button
                  type="button"
                  onClick={() => setTab("novo")}
                  className="col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 font-black text-white transition hover:bg-emerald-700"
                >
                  <Crown size={18} />
                  Ativar plano
                </button>
              ) : (
                <Link
                  href={loginUrl}
                  className="col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 font-black text-white transition hover:bg-slate-800"
                >
                  <ShieldCheck size={18} />
                  Entrar para publicar
                </Link>
              )}
            </div>
          </div>
        </header>

        <section aria-label="Controles de pedidos" className="mb-4 min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-emerald-700 sm:h-10 sm:w-10">
              <SlidersHorizontal size={20} />
            </span>
            <div>
              <p className="text-xs font-black uppercase text-emerald-700">Controles de pedidos</p>
              <h2 className="text-lg font-black text-slate-950 sm:text-xl">{filteredCountLabel}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{radiusSummary}</p>
              {radiusError ? <p className="mt-2 text-sm font-semibold text-red-600">{radiusError}</p> : null}
            </div>
          </div>

          <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(12rem,0.85fr)_minmax(18rem,1fr)_auto] lg:items-end">
            <label className="grid min-w-0 gap-1 text-sm font-semibold text-slate-700">
              Cidade dos pedidos
              <select
                id="board-city"
                aria-label="Cidade dos pedidos"
                value={city}
                onChange={e => {
                  setPage(1);
                  router.push(buildCityUrl(e.target.value));
                }}
                className="min-h-11 min-w-0 max-w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
              >
                {supportedCities.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid min-w-0 gap-1 text-sm font-semibold text-slate-700">
              Raio de busca (km)
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={radiusKm}
                  onChange={event => {
                    const value = parseInt(event.target.value);
                    if (!isNaN(value) && value > 0) {
                      updateRadius(value);
                    }
                  }}
                  className="min-h-11 min-w-0 w-full rounded-md border border-slate-200 bg-white px-3 outline-none focus:border-emerald-500 sm:w-24"
                />
                <div className="flex flex-wrap gap-1">
                  {radiusPresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateRadius(preset)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold transition ${
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
              {locationButtonLabel}
            </button>
          </div>

          <div className="mt-4 flex min-w-0 flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
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

            <select
              aria-label="Ordenar pedidos"
              value={sort}
              onChange={e => {
                setPage(1);
                router.push(buildSortUrl(e.target.value));
              }}
            className="min-h-10 min-w-0 max-w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
            >
              {deliverySortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {isBusiness ? <ManagedDeliveryRequests requests={managedRequests} /> : null}

        {tab === "novo" ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            {canPost ? (
              <DeliveryRequestForm defaultCity={city} />
            ) : isBusiness ? (
              <div className="grid gap-5">
                <div className="rounded-lg bg-slate-50 p-5 text-center sm:p-8">
                  <h2 className="text-2xl font-black text-slate-950">Assine um plano para publicar</h2>
                  <p className="mx-auto mt-2 max-w-lg text-slate-600">
                    Empresas precisam de uma assinatura ativa ou em trial para cadastrar pedidos.
                  </p>
                </div>
                <PricingPlans compact enableCheckout />
              </div>
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
          <section aria-label="Lista de pedidos" className="grid min-w-0 gap-3">
            <div className="flex flex-col gap-1 px-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-emerald-700">Lista de pedidos</p>
                <h2 className="text-xl font-black text-slate-950">Pedidos prontos para escolher</h2>
              </div>
              <p className="text-sm font-semibold text-slate-500">
                Ordene, filtre por raio, aceite pelo app e converse pelo WhatsApp.
              </p>
            </div>

            {pagedRequests.map(request => (
              <DeliveryRequestCard key={request.id} loginUrl={loginUrl} request={request} />
            ))}
            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-3 py-4">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-slate-400 disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-semibold text-slate-700">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-slate-400 disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            ) : null}
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center sm:p-10">
            <h2 className="text-2xl font-black text-slate-950">Nenhuma oferta neste raio em {city}</h2>
            <p className="mt-2 text-slate-600">Aumente o raio de busca ou tente outra cidade.</p>
          </section>
        )}

        <NewRequestDialog city={city} open={dialogOpen} onClose={() => setDialogOpen(false)} />
      </div>
    </div>
  );
}
