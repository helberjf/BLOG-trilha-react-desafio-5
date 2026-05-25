import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CitySelector } from "@/components/delivery/CitySelector";
import { DeliveryBoard } from "@/components/delivery/DeliveryBoard";
import { DeliveryRequestCard } from "@/components/delivery/DeliveryRequestCard";
import LoginPage from "@/app/(auth)/login/page";
import { RegisterForm } from "@/app/(auth)/cadastro/RegisterForm";
import { fallbackDeliveryRequests } from "@/lib/delivery/shared";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/pedidos"
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" })
}));

describe("delivery UI", () => {
  it("renders city selection", () => {
    render(<CitySelector />);

    expect(
      screen.getByRole("heading", {
        name: /publique entregas e encontre motoboys disponiveis/i
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sou empresa/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sou entregador/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sou empresa/i })).toHaveAttribute(
      "href",
      "/cadastro?tipo=empresa"
    );
    expect(screen.getByRole("link", { name: /sou entregador/i })).toHaveAttribute(
      "href",
      "/cadastro?tipo=entregador"
    );
    expect(screen.getByText(/pedido destacado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver pedidos/i })).toBeInTheDocument();
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
          speed: null
        },
        timestamp: Date.now()
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
    render(<DeliveryRequestCard request={fallbackDeliveryRequests[0]} />);

    expect(screen.getByText("Entrega expressa de marmitas")).toBeInTheDocument();
    expect(screen.getByText(/pedido destacado/i)).toBeInTheDocument();
    expect(screen.getByText(/empresa verificada/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /chamar no whatsapp/i })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/")
    );
    expect(screen.getByRole("link", { name: /ver rota gratis/i })).toHaveAttribute(
      "href",
      expect.stringContaining("https://www.google.com/maps/dir/")
    );
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

    expect(screen.getByText(/mercado local/i)).toBeInTheDocument();
    expect(screen.getByText(/plano comercial/i)).toBeInTheDocument();
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
          speed: null
        },
        timestamp: Date.now()
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

    expect(screen.getByText(/raio de ofertas/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/raio de busca/i), "3");
    await user.click(screen.getByRole("button", { name: /usar minha localizacao para ofertas/i }));

    expect(await screen.findByText(/1 oferta em ate 3 km/i)).toBeInTheDocument();
    expect(screen.getByText("Entrega expressa de marmitas")).toBeInTheDocument();
    expect(screen.queryByText("Documento urgente no centro")).not.toBeInTheDocument();
  });

  it("lets couriers search orders by city from the board", async () => {
    const user = userEvent.setup();

    render(
      <DeliveryBoard city="Sao Paulo" requests={fallbackDeliveryRequests} sort="recentes" />
    );

    expect(screen.getByText("Entrega expressa de marmitas")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /buscar por cidade/i }));
    await user.selectOptions(screen.getByLabelText(/cidade dos pedidos/i), "Campinas");

    expect(screen.getByText(/pedidos em campinas/i)).toBeInTheDocument();
    expect(screen.getByText("Coleta de peca automotiva")).toBeInTheDocument();
    expect(screen.queryByText("Entrega expressa de marmitas")).not.toBeInTheDocument();
  });

  it("shows registration benefits by account type", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    expect(screen.getByText(/receba oportunidades por cidade/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/tipo de conta/i), "BUSINESS");

    expect(screen.getByText(/publique pedidos com CNPJ verificado/i)).toBeInTheDocument();
  });

  it("opens registration as business when the CTA targets companies", () => {
    render(<RegisterForm initialRole="BUSINESS" />);

    expect(screen.getByLabelText(/tipo de conta/i)).toHaveValue("BUSINESS");
    expect(screen.getByText(/publique pedidos com CNPJ verificado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument();
  });

  it("positions login as a commercial continuation", () => {
    render(<LoginPage />);

    expect(screen.getByText(/continue sua operacao local/i)).toBeInTheDocument();
    expect(screen.getByText(/retorno para o pedido/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /criar conta empresarial/i })).toHaveAttribute(
      "href",
      "/cadastro?tipo=empresa"
    );
  });
});
