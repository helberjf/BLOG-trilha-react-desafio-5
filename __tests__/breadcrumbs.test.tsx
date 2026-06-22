import { render, screen, within } from "@testing-library/react";

import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

describe("Breadcrumbs", () => {
  it("renders linked ancestors and marks the current page", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Pedidos", href: "/pedidos?cidade=Sao%20Paulo" },
          { label: "Sao Paulo" }
        ]}
      />
    );

    const nav = screen.getByRole("navigation", { name: /breadcrumb/i });

    expect(within(nav).getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("link", { name: "Pedidos" })).toHaveAttribute(
      "href",
      "/pedidos?cidade=Sao%20Paulo"
    );
    expect(within(nav).getByText("Sao Paulo")).toHaveAttribute("aria-current", "page");
  });
});
