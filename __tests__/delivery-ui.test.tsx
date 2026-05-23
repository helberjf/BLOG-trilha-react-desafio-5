import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CitySelector } from "@/components/delivery/CitySelector";
import { DeliveryBoard } from "@/components/delivery/DeliveryBoard";
import { DeliveryRequestCard } from "@/components/delivery/DeliveryRequestCard";
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

    expect(screen.getByRole("heading", { name: /entregador/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver pedidos/i })).toBeInTheDocument();
  });

  it("renders request cards with WhatsApp action", () => {
    render(<DeliveryRequestCard request={fallbackDeliveryRequests[0]} />);

    expect(screen.getByText("Entrega expressa de marmitas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /chamar no whatsapp/i })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/")
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

    await user.click(screen.getByRole("button", { name: /novo pedido/i }));

    expect(screen.getByText(/entre como empresario/i)).toBeInTheDocument();
  });
});
