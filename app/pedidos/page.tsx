import { DeliveryBoard } from "@/components/delivery/DeliveryBoard";
import { auth } from "@/auth";
import {
  getCompanyManagedDeliveryRequests,
  getDeliverySearchRequests,
  normalizeSort
} from "@/lib/delivery/requests";

type PedidosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PedidosPage({ searchParams }: PedidosPageProps) {
  const session = await auth();
  const params = await searchParams;
  const cityParam = params.cidade;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;
  const selectedCity = city?.trim() || "Juiz de Fora";
  const sort = normalizeSort(params.ordenar);

  const latParam = typeof params.lat === "string" ? parseFloat(params.lat) : undefined;
  const lngParam = typeof params.lng === "string" ? parseFloat(params.lng) : undefined;
  const raioParam = typeof params.raio === "string" ? parseInt(params.raio) : undefined;
  const hasCoordinates =
    latParam !== undefined && !isNaN(latParam) && lngParam !== undefined && !isNaN(lngParam);
  const radiusKm = raioParam !== undefined && !isNaN(raioParam) && raioParam > 0 ? raioParam : undefined;
  const requests = await getDeliverySearchRequests({
    city: selectedCity,
    coordinates: hasCoordinates ? { latitude: latParam, longitude: lngParam } : undefined,
    radiusKm,
    sort
  });
  const managedRequests =
    session?.user?.role === "BUSINESS"
      ? await getCompanyManagedDeliveryRequests(session.user.id)
      : [];

  return (
    <DeliveryBoard
      city={selectedCity}
      requests={requests}
      managedRequests={managedRequests}
      sort={sort}
      initialLat={latParam !== undefined && !isNaN(latParam) ? latParam : undefined}
      initialLng={lngParam !== undefined && !isNaN(lngParam) ? lngParam : undefined}
      initialRadius={radiusKm}
    />
  );
}
