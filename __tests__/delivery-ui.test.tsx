import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CitySelector } from "@/components/delivery/CitySelector";
import { DeliveryBoard } from "@/components/delivery/DeliveryBoard";
import { DeliveryRequestCard } from "@/components/delivery/DeliveryRequestCard";
import { DeliveryRequestForm } from "@/components/delivery/DeliveryRequestForm";
import LoginPage from "@/app/(auth)/login/page";
import { RegisterForm } from "@/app/(auth)/cadastro/RegisterForm";
import { fallbackDeliveryRequests } from "@/lib/delivery/shared";

const pushMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());
const replaceMock = vi.hoisted(() => vi.fn());
const sessionMock = vi.hoisted(() => ({
  data: null as unknown,
  status: "unauthenticated"
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
    replace: replaceMock
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/pedidos"
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: sessionMock.data, status: sessionMock.status })
}));

describe("delivery UI", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    replaceMock.mockClear();
    sessionMock.data = null;
    sessionMock.status = "unauthenticated";
  });

  it("renders city selection", () => {
    render(<CitySelector />);

    expect(screen.queryByRole("navigation", { name: /breadcrumb/i })).not.toBeInTheDocument();
    expect(screen.getByText(/marketplace local de entregas/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /entregas locais por cidade/i
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/escolha a cidade para ver pedidos abertos/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /pedidos disponiveis agora/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^empresa$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^entregador$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /criar conta empresa/i })).toHaveAttribute(
      "href",
      "/cadastro?tipo=empresa"
    );
    expect(screen.getByRole("link", { name: /criar conta entregador/i })).toHaveAttribute(
      "href",
      "/cadastro?tipo=entregador"
    );
    expect(screen.getAllByText(/patrocinado/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/R\$ 35,90/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2 meses gratis/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/R\$ 69,90/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver pedidos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /usar minha localizacao/i })).toBeInTheDocument();
  });

  it("shows a mobile-first example delivery form on the landing page", () => {
    render(<CitySelector />);

    expect(screen.getByRole("heading", { name: /exemplo de pedido de entrega/i })).toBeInTheDocument();
    expect(screen.getByText(/o entregaapp conecta empresas e entregadores locais/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/local de retirada/i)).toHaveValue("Rua Vergueiro, 1200 - Paraiso");
    expect(screen.getByLabelText(/local de entrega/i)).toHaveValue("Av. Paulista, 900 - Bela Vista");
    expect(screen.getByLabelText(/valor da entrega/i)).toHaveValue("R$ 28,00");
    expect(screen.getByLabelText(/whatsapp de contato/i)).toHaveValue("(11) 98888-7777");
  });

  it("uses browser location to select the nearest city for free", async () => {
    const user = userEvent.setup();
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 18,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      });
    });

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition }
    });

    render(<CitySelector />);

    await user.click(screen.getByRole("button", { name: /usar minha localizacao/i }));

    expect(await screen.findByText(/localizacao detectada: sao paulo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cidade/i)).toHaveValue("Sao Paulo");
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ enableHighAccuracy: true })
    );
  });

  it("renders request cards with WhatsApp action", () => {
    render(<DeliveryRequestCard request={{ ...fallbackDeliveryRequests[0], pickupDistanceKm: 2.4 }} />);

    const card = screen.getByRole("article", { name: /pedido: entrega expressa de marmitas/i });

    expect(within(card).getByText("Entrega expressa de marmitas")).toBeInTheDocument();
    expect(within(card).getByText(/R\$ 28,00/i)).toBeInTheDocument();
    expect(within(card).getByText(/2.4 km de voce/i)).toBeInTheDocument();
    expect(within(card).getByText(/patrocinado/i)).toBeInTheDocument();
    expect(within(card).getByText(/empresa verificada/i)).toBeInTheDocument();
    expect(within(card).getByText(/sem avaliacoes/i)).toBeInTheDocument();
    expect(within(card).queryByText("4.8")).not.toBeInTheDocument();
    expect(within(card).getByRole("link", { name: /chamar no whatsapp/i })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/")
    );
    expect(within(card).getByRole("link", { name: /ver rota/i })).toHaveAttribute(
      "href",
      expect.stringContaining("https://www.google.com/maps/dir/")
    );
  });

  it("lets authenticated couriers accept a delivery inside the app before using WhatsApp", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ request: { id: "seed-1" } }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    sessionMock.status = "authenticated";
    sessionMock.data = {
      user: {
        id: "courier_1",
        role: "COURIER"
      }
    };

    render(<DeliveryRequestCard request={{ ...fallbackDeliveryRequests[0], pickupDistanceKm: 2.4 }} />);

    const card = screen.getByRole("article", { name: /pedido: entrega expressa de marmitas/i });
    expect(within(card).getByText(/o app registra o aceite/i)).toBeInTheDocument();

    await user.click(within(card).getByRole("button", { name: /aceitar entrega/i }));

    expect(fetchMock).toHaveBeenCalledWith("/api/delivery-requests/seed-1/accept", { method: "POST" });
    expect(refreshMock).toHaveBeenCalled();
  });

  it("switches to the new request tab", async () => {
    const user = userEvent.setup();
    render(
      <DeliveryBoard
        city="Sao Paulo"
        requests={fallbackDeliveryRequests.filter(request => request.city === "Sao Paulo")}
        sort="recentes"
      />
    );

    const breadcrumb = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(within(breadcrumb).getByRole("link", { name: /inicio/i })).toHaveAttribute("href", "/");
    expect(within(breadcrumb).getByText("Sao Paulo")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText(/painel de pedidos/i)).toBeInTheDocument();
    expect(screen.getByText(/controles de pedidos/i)).toBeInTheDocument();
    expect(screen.getByText(/lista de pedidos/i)).toBeInTheDocument();
    expect(screen.getByText(/rotas disponiveis/i)).toBeInTheDocument();
    expect(screen.queryByText(/mercado local/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/plano comercial/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /entrar para publicar/i })).toHaveAttribute(
      "href",
      expect.stringContaining("callbackUrl=")
    );

    await user.click(screen.getByRole("button", { name: /novo pedido/i }));

    expect(screen.getByText(/entre como empresario/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^criar conta$/i })).toHaveAttribute(
      "href",
      "/cadastro?tipo=empresa"
    );
  });

  it("shows accepted deliveries for businesses to complete and review couriers", () => {
    sessionMock.status = "authenticated";
    sessionMock.data = {
      user: {
        id: "business_1",
        role: "BUSINESS",
        cnpj: "11.222.333/0001-81",
        cpf: "529.982.247-25",
        companyPostalCode: "36010-000",
        subscriptionStatus: "ACTIVE"
      }
    };

    render(
      <DeliveryBoard
        city="Sao Paulo"
        requests={[]}
        sort="recentes"
        managedRequests={[
          {
            ...fallbackDeliveryRequests[0],
            status: "DONE",
            acceptedBy: {
              id: "courier_1",
              name: "Joao Entregador",
              whatsapp: "11999990000"
            }
          }
        ]}
      />
    );

    expect(screen.getByRole("heading", { name: /aceites da empresa/i })).toBeInTheDocument();
    expect(screen.getByText(/joao entregador/i)).toBeInTheDocument();
    expect(screen.getByText(/o app somente conecta/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /avaliar entregador/i })).toBeInTheDocument();
  });

  it("filters courier offers by location radius", async () => {
    const user = userEvent.setup();
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: -23.5729,
          longitude: -46.6424,
          accuracy: 12,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      });
    });

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition }
    });

    render(
      <DeliveryBoard
        city="Sao Paulo"
        requests={fallbackDeliveryRequests.filter(request => request.city === "Sao Paulo")}
        sort="recentes"
      />
    );

    expect(screen.getByRole("region", { name: /controles de pedidos/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /usar localizacao/i }));

    expect(await screen.findByText(/1 oferta em ate 3 km/i)).toBeInTheDocument();
    expect(screen.getByText("Entrega expressa de marmitas")).toBeInTheDocument();
    expect(screen.queryByText("Documento urgente no centro")).not.toBeInTheDocument();
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("lat=-23.572900"));
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("lng=-46.642400"));
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("raio=3"));

    await user.click(screen.getByRole("button", { name: /^5 km$/i }));

    expect(pushMock).toHaveBeenLastCalledWith(expect.stringContaining("raio=5"));
  });

  it("lets couriers search orders by city from the board", async () => {
    const user = userEvent.setup();

    render(
      <DeliveryBoard city="Sao Paulo" requests={fallbackDeliveryRequests} sort="recentes" />
    );

    expect(screen.getByText("Entrega expressa de marmitas")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/cidade dos pedidos/i), "Campinas");

    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("cidade=Campinas"));
  });

  it("lets businesses attach pickup coordinates for radius search", async () => {
    const user = userEvent.setup();
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: -23.5729,
          longitude: -46.6424,
          accuracy: 12,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      });
    });

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition }
    });

    render(<DeliveryRequestForm defaultCity="Sao Paulo" />);

    await user.click(screen.getByRole("button", { name: /usar localizacao da retirada/i }));

    expect(await screen.findByText(/localizacao da retirada salva/i)).toBeInTheDocument();
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ enableHighAccuracy: true })
    );
  });

  it("shows registration benefits by account type", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    expect(screen.getByText(/receba oportunidades por cidade/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sou empresa/i }));

    expect(screen.getByText(/publique pedidos com CNPJ verificado/i)).toBeInTheDocument();
  });

  it("opens registration as business when the CTA targets companies", () => {
    render(<RegisterForm initialRole="BUSINESS" />);

    expect(screen.getByRole("heading", { name: /cadastro de empresa/i })).toBeInTheDocument();
    expect(screen.getByText(/publique pedidos com CNPJ verificado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^cnpj$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf do responsavel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cep do cnpj/i)).toBeInTheDocument();
  });

  it("positions login as a commercial continuation", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const breadcrumb = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(within(breadcrumb).getByRole("link", { name: /inicio/i })).toHaveAttribute("href", "/");
    expect(within(breadcrumb).getByText(/entrar/i)).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /^entrar como entregador$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^entrar como empresa$/i })).toBeInTheDocument();
    expect(screen.getByText(/acesso selecionado: entregador/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar com google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar como entregador com email/i })).toBeInTheDocument();
    expect(screen.getByText(/entrar na sua conta/i)).toBeInTheDocument();
    expect(screen.getByText(/publique pedidos ou encontre entregas perto de voce/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /criar conta como entregador/i })).toHaveAttribute(
      "href",
      "/cadastro?tipo=entregador"
    );

    await user.click(screen.getByRole("button", { name: /^entrar como empresa$/i }));

    expect(screen.getByText(/acesso selecionado: empresa/i)).toBeInTheDocument();
    expect(screen.getByText(/publique pedidos e gerencie sua assinatura/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /entrar com google/i })).not.toBeInTheDocument();
    expect(screen.getByText(/empresas entram com email e senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar como empresa com email/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /criar conta empresarial/i })).toHaveAttribute(
      "href",
      "/cadastro?tipo=empresa"
    );
    expect(replaceMock).toHaveBeenCalledWith("/login?tipo=empresa", { scroll: false });
  });
});
