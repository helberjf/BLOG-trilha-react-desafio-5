import { DeliveryBoard } from "@/components/delivery/DeliveryBoard";
import { getDeliveryRequests, normalizeSort } from "@/lib/delivery/requests";

type PedidosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PedidosPage({ searchParams }: PedidosPageProps) {
  const params = await searchParams;
  const cityParam = params.cidade;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;
  const selectedCity = city?.trim() || "Sao Paulo";
  const sort = normalizeSort(params.ordenar);
  const requests = await getDeliveryRequests(selectedCity, sort);

  const latParam = typeof params.lat === "string" ? parseFloat(params.lat) : undefined;
  const lngParam = typeof params.lng === "string" ? parseFloat(params.lng) : undefined;
  const raioParam = typeof params.raio === "string" ? parseInt(params.raio) : undefined;

  return (
    <DeliveryBoard
      city={selectedCity}
      requests={requests}
      sort={sort}
      initialLat={latParam !== undefined && !isNaN(latParam) ? latParam : undefined}
      initialLng={lngParam !== undefined && !isNaN(lngParam) ? lngParam : undefined}
      initialRadius={raioParam !== undefined && !isNaN(raioParam) ? raioParam : undefined}
    />
  );
}
