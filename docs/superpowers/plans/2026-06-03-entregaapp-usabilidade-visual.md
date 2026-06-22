# EntregaApp Usabilidade Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the EntregaApp home and pedidos board around the approved "Marketplace Operacional" direction, with usability as the primary design constraint.

**Architecture:** Keep the existing Next.js App Router structure and delivery component boundaries. Update the existing UI components in place, preserving routing, geolocation, sorting, pagination, billing, and authentication behavior while simplifying visual hierarchy and moving the pedidos list closer to the controls.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, lucide-react, Vitest, Testing Library.

---

## Scope Check

The approved spec covers one cohesive subsystem: the delivery marketplace UI across `/` and `/pedidos`. It does not require new APIs, new data models, new auth behavior, or billing changes.

The worktree already contains many local modifications. Implementers must not revert unrelated changes. Touch only the files listed below unless a test expectation requires a small, directly related update.

## File Structure

- Modify: `__tests__/delivery-ui.test.tsx`
  - Responsibility: lock the new usability contract for home, board controls, card scanning, and preserved interactions.
- Modify: `components/delivery/CitySelector.tsx`
  - Responsibility: home page composition, city selection, location request, compact live-request preview, and audience entry points.
- Modify: `components/delivery/DeliveryBoard.tsx`
  - Responsibility: `/pedidos` operational layout, city/radius/sort controls, tab switching, pagination, and post/login actions.
- Modify: `components/delivery/DeliveryRequestCard.tsx`
  - Responsibility: individual pedido hierarchy, WhatsApp action, route action, value, addresses, metadata, sponsored state.
- Modify: `app/globals.css`
  - Responsibility: global neutral page background and base typography only.

Do not modify business logic in `lib/delivery/*`, auth routes, billing APIs, Prisma schema, or registration/login components for this redesign.

---

### Task 1: Update UI Tests For The Usability Contract

**Files:**
- Modify: `__tests__/delivery-ui.test.tsx`

- [ ] **Step 1: Update the home rendering test**

Replace the body of `it("renders city selection", () => { ... })` with this test. It keeps existing functional assertions, but changes the visual-copy contract away from promotional blocks and toward the main city-to-pedidos task.

```tsx
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
```

- [ ] **Step 2: Update the request card test**

Replace the body of `it("renders request cards with WhatsApp action", () => { ... })` with this version. It verifies the card is named for assistive tech and preserves route/WhatsApp behavior.

```tsx
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
```

- [ ] **Step 3: Update the board tab-switching test**

Inside `it("switches to the new request tab", async () => { ... })`, replace the assertions between the breadcrumb checks and the click on `Novo pedido` with this block.

```tsx
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
```

- [ ] **Step 4: Update the location-radius test**

Inside `it("filters courier offers by location radius", async () => { ... })`, replace the first control assertion and click with this code.

```tsx
expect(screen.getByRole("region", { name: /controles de pedidos/i })).toBeInTheDocument();

await user.click(screen.getByRole("button", { name: /usar localizacao/i }));
```

Keep the later expectations for `1 oferta em ate 3 km`, request visibility, URL `lat`, `lng`, `raio=3`, and the `5 km` preset.

- [ ] **Step 5: Run the UI test and verify it fails for the expected reason**

Run:

```bash
npm test -- --run __tests__/delivery-ui.test.tsx
```

Expected: FAIL before implementation, with missing text/role errors for the new home heading, board region, card article name, or updated link names.

- [ ] **Step 6: Commit the failing test contract**

Run:

```bash
git add __tests__/delivery-ui.test.tsx
git commit -m "test: define entregaapp usability redesign contract"
```

Expected: a commit containing only the UI test contract changes. If the worktree has unrelated changes in the same file from before this plan, inspect `git diff -- __tests__/delivery-ui.test.tsx` and stage only the hunks from Steps 1-4.

---

### Task 2: Redesign The Home Around City Selection

**Files:**
- Modify: `components/delivery/CitySelector.tsx`

- [ ] **Step 1: Run the home test slice before editing**

Run:

```bash
npm test -- --run __tests__/delivery-ui.test.tsx -t "renders city selection"
```

Expected: FAIL because the implementation still renders the old home copy and hierarchy.

- [ ] **Step 2: Replace the home constants**

In `components/delivery/CitySelector.tsx`, keep `DEFAULT_CITY` and replace `audienceCards`, `liveRequests`, and `proofStats` with this block.

```tsx
const audienceCards = [
  {
    title: "Empresa",
    description: "Publique pedidos com CNPJ validado e receba contatos diretos no WhatsApp.",
    href: "/cadastro?tipo=empresa",
    linkLabel: "Criar conta empresa",
    icon: BriefcaseBusiness,
    tone: "emerald"
  },
  {
    title: "Entregador",
    description: "Compare valor, horario, rota e distancia antes de chamar a empresa.",
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
```

- [ ] **Step 3: Replace the home JSX**

Replace the `return (...)` in `CitySelector` with this JSX. Keep the existing state, `handleSubmit`, `handleUseLocation`, and `useEffect` logic unchanged.

```tsx
return (
  <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      <nav className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-lg font-black tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Bike size={19} />
          </span>
          EntregaApp
        </div>
        <div className="grid w-full grid-cols-2 gap-2 text-center text-sm font-bold sm:flex sm:w-auto sm:items-center">
          <a href="/login" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:border-slate-300">
            Entrar
          </a>
          <a href="/cadastro" className="rounded-md bg-slate-950 px-3 py-2 text-white hover:bg-slate-800">
            Criar conta
          </a>
        </div>
      </nav>

      <section className="grid gap-6 py-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.75fr)] lg:items-start lg:py-10">
        <div className="grid gap-5">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-black uppercase text-emerald-700">
              <Navigation size={14} />
              Marketplace local de entregas
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-normal sm:text-4xl lg:text-5xl">
              Entregas locais por cidade
            </h1>
            <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-slate-700">
              Escolha a cidade para ver pedidos abertos, comparar rotas e falar direto com a empresa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <label className="sr-only" htmlFor="city">
                Cidade
              </label>
              <select
                id="city"
                value={city}
                onChange={event => setCity(event.target.value)}
                className="min-h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-3 font-semibold text-slate-900 outline-none focus:border-emerald-500"
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
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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

      <section className="grid gap-4 border-t border-slate-200 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
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
              ["Entregador escolhe", "Cidade, raio e ordenacao ajudam a priorizar rotas.", BadgeCheck],
              ["Contato direto", "WhatsApp abre com mensagem pronta para conversa.", MessageCircle]
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
```

- [ ] **Step 4: Run the home tests**

Run:

```bash
npm test -- --run __tests__/delivery-ui.test.tsx -t "renders city selection|uses browser location"
```

Expected: PASS for both home-related tests.

- [ ] **Step 5: Commit the home redesign**

Run:

```bash
git add components/delivery/CitySelector.tsx
git commit -m "feat: simplify entregaapp home usability"
```

Expected: a commit containing the home component changes. If the file has unrelated pre-existing changes, stage only the hunks from Steps 2-3.

---

### Task 3: Redesign The Pedidos Board As An Operational Panel

**Files:**
- Modify: `components/delivery/DeliveryBoard.tsx`

- [ ] **Step 1: Run the board tests before editing**

Run:

```bash
npm test -- --run __tests__/delivery-ui.test.tsx -t "switches to the new request tab|filters courier offers by location radius|lets couriers search orders by city"
```

Expected: FAIL for the new copy/region assertions and PASS or FAIL unchanged for preserved behavior depending on whether Task 1 is already committed.

- [ ] **Step 2: Update the icon imports**

In `components/delivery/DeliveryBoard.tsx`, replace the lucide import block with this smaller set.

```tsx
import {
  Bike,
  ChevronLeft,
  ChevronRight,
  Crown,
  LocateFixed,
  MapPinned,
  Plus,
  ShieldCheck,
  SlidersHorizontal
} from "lucide-react";
```

- [ ] **Step 3: Add board display labels**

After `const radiusSummary = ...`, add these constants.

```tsx
const locationButtonLabel = isLocatingOffers ? "Buscando..." : "Usar localizacao";
const filteredCountLabel = `${visibleRequests.length} ${
  visibleRequests.length === 1 ? "rota disponivel" : "rotas disponiveis"
}`;
```

- [ ] **Step 4: Replace the board JSX**

Replace the `return (...)` in `DeliveryBoard` with this JSX. Keep all helper functions, memoized values, and state above it unchanged.

```tsx
return (
  <div className="min-h-screen bg-[#f6f8fb]">
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Pedidos", href: currentBoardUrl },
          { label: city }
        ]}
      />

      <header className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
                <Bike size={19} />
              </span>
              EntregaApp
            </Link>
            <p className="mt-4 text-xs font-black uppercase text-emerald-700">Painel de pedidos</p>
            <h1 className="mt-1 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              Pedidos em {city}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Compare valor, horario, distancia e rota antes de chamar a empresa no WhatsApp.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[repeat(2,minmax(0,9rem))] lg:min-w-[21rem]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-black uppercase text-slate-500">Rotas disponiveis</p>
              <strong className="mt-1 block text-2xl text-slate-950">{visibleRequests.length}</strong>
              <span className="text-xs font-semibold text-slate-500">filtradas agora</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
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
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 font-black text-white transition hover:bg-emerald-700 sm:col-span-2"
              >
                <Plus size={18} />
                Novo pedido
              </button>
            ) : isBusiness ? (
              <button
                type="button"
                onClick={() => setTab("novo")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 font-black text-white transition hover:bg-emerald-700 sm:col-span-2"
              >
                <Crown size={18} />
                Ativar plano
              </button>
            ) : (
              <Link
                href={loginUrl}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 font-black text-white transition hover:bg-slate-800 sm:col-span-2"
              >
                <ShieldCheck size={18} />
                Entrar para publicar
              </Link>
            )}
          </div>
        </div>
      </header>

      <section aria-label="Controles de pedidos" className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-emerald-700">
            <SlidersHorizontal size={20} />
          </span>
          <div>
            <p className="text-xs font-black uppercase text-emerald-700">Controles de pedidos</p>
            <h2 className="text-xl font-black text-slate-950">{filteredCountLabel}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{radiusSummary}</p>
            {radiusError ? <p className="mt-2 text-sm font-semibold text-red-600">{radiusError}</p> : null}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(12rem,0.85fr)_minmax(18rem,1fr)_auto] lg:items-end">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Cidade dos pedidos
            <select
              id="board-city"
              aria-label="Cidade dos pedidos"
              value={city}
              onChange={e => {
                setPage(1);
                router.push(buildCityUrl(e.target.value));
              }}
              className="min-h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
            >
              {supportedCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Raio de busca (km)
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                className="min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 outline-none focus:border-emerald-500 sm:w-24"
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

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
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
            className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
          >
            {deliverySortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </section>

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
        <section aria-label="Lista de pedidos" className="grid gap-3">
          <div className="flex flex-col gap-1 px-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-emerald-700">Lista de pedidos</p>
              <h2 className="text-xl font-black text-slate-950">Pedidos prontos para escolher</h2>
            </div>
            <p className="text-sm font-semibold text-slate-500">Ordene, filtre por raio e chame no WhatsApp.</p>
          </div>

          {pagedRequests.map(request => (
            <DeliveryRequestCard key={request.id} request={request} />
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
```

- [ ] **Step 5: Run the board tests**

Run:

```bash
npm test -- --run __tests__/delivery-ui.test.tsx -t "switches to the new request tab|filters courier offers by location radius|lets couriers search orders by city"
```

Expected: PASS for the board tab, location radius, and city-switch tests.

- [ ] **Step 6: Commit the board redesign**

Run:

```bash
git add components/delivery/DeliveryBoard.tsx
git commit -m "feat: streamline pedidos board controls"
```

Expected: a commit containing only the board component changes. If the file has unrelated pre-existing changes, stage only the hunks from Steps 2-4.

---

### Task 4: Redesign Pedido Cards For Faster Scanning

**Files:**
- Modify: `components/delivery/DeliveryRequestCard.tsx`

- [ ] **Step 1: Run the card test before editing**

Run:

```bash
npm test -- --run __tests__/delivery-ui.test.tsx -t "renders request cards"
```

Expected: FAIL because the current card has no named `article` and the WhatsApp link name is not `Chamar no WhatsApp`.

- [ ] **Step 2: Replace the card JSX**

In `DeliveryRequestCard`, replace the current `return (...)` with this JSX. Keep the existing `message`, `mapsRouteUrl`, and `pickupDistance` calculations.

```tsx
return (
  <article
    aria-label={`Pedido: ${request.title}`}
    className={`relative overflow-hidden rounded-lg border bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md ${
      request.isSponsored ? "border-emerald-500 ring-1 ring-emerald-100" : "border-slate-200"
    }`}
  >
    {request.isSponsored ? <div className="h-1 bg-emerald-500" /> : null}
    <div className="grid gap-3 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                request.isSponsored ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <Zap size={11} />
              {request.isSponsored ? "Patrocinado" : "Plano empresa"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
              <BadgeCheck size={11} />
              Empresa verificada
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
              <ShieldMinus size={11} />
              Sem avaliacoes
            </span>
          </div>

          <p className="mt-2 text-[10px] font-black uppercase text-emerald-700">{request.city}</p>
          <h2 className="mt-0.5 text-lg font-black leading-snug text-slate-950">{request.title}</h2>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{request.description}</p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 rounded-md bg-emerald-50 px-3 py-2 sm:block sm:min-w-28 sm:text-right">
          <p className="text-xs font-bold text-emerald-700">Valor</p>
          <p className="text-xl font-black text-emerald-800">{centsToCurrency(request.deliveryValueCents)}</p>
        </div>
      </div>

      <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
        <div className="flex min-w-0 gap-2 rounded-md bg-slate-50 px-3 py-2">
          <MapPin className="mt-0.5 shrink-0 text-slate-400" size={14} />
          <span className="min-w-0">
            <strong className="block text-slate-950">Retirada</strong>
            <span className="break-words">{request.pickupAddress}</span>
          </span>
        </div>
        <div className="flex min-w-0 gap-2 rounded-md bg-slate-50 px-3 py-2">
          <MapPin className="mt-0.5 shrink-0 text-slate-400" size={14} />
          <span className="min-w-0">
            <strong className="block text-slate-950">Entrega</strong>
            <span className="break-words">{request.dropoffAddress}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={13} />
            {request.scheduledDate} as {request.scheduledTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} />
            {request.estimatedMinutes} min
          </span>
          {pickupDistance ? (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <MapPin size={13} />
              {pickupDistance} km de voce
            </span>
          ) : null}
          <span className="font-black text-slate-900">{request.posterName}</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-[auto_auto] lg:ml-auto">
          <a
            href={mapsRouteUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Ver rota"
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            <Route size={15} />
            Rota
          </a>
          <a
            href={formatWhatsAppUrl(request.posterWhatsapp, message)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <MessageCircle size={15} />
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  </article>
);
```

- [ ] **Step 3: Run the card test**

Run:

```bash
npm test -- --run __tests__/delivery-ui.test.tsx -t "renders request cards"
```

Expected: PASS.

- [ ] **Step 4: Commit the card redesign**

Run:

```bash
git add components/delivery/DeliveryRequestCard.tsx
git commit -m "feat: improve pedido card scanability"
```

Expected: a commit containing only card component changes. If the file has unrelated pre-existing changes, stage only the hunks from Step 2.

---

### Task 5: Apply The Neutral Global Surface And Verify End-To-End

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Update the global body surface**

In `app/globals.css`, replace the `body` block with this version.

```css
  body {
    margin: 0;
    background: #f6f8fb;
    color: #111827;
    font-family: Arial, Helvetica, sans-serif;
  }
```

- [ ] **Step 2: Run the full delivery UI test file**

Run:

```bash
npm test -- --run __tests__/delivery-ui.test.tsx
```

Expected: PASS for all tests in `delivery-ui.test.tsx`.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 4: Start the app locally**

Run:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Expected: Next dev server starts on `http://127.0.0.1:3001`. If port `3001` is busy, use `3002` and record the URL in the final verification notes.

- [ ] **Step 5: Verify desktop home visually**

Open the local URL in Browser:

```text
http://127.0.0.1:3001
```

Expected visual checks:

- The first viewport shows the brand, headline, city select, `Ver pedidos`, and `Usar minha localizacao`.
- The live pedidos preview is visible on desktop without pushing the primary city action down.
- Plan cards are below the first decision area.
- Text does not overlap and button labels fit.

- [ ] **Step 6: Verify desktop pedidos visually**

Open:

```text
http://127.0.0.1:3001/pedidos?cidade=Sao%20Paulo
```

Expected visual checks:

- Header is compact.
- `Controles de pedidos` appears before the list.
- The pedidos list starts soon after controls.
- `Mercado local` and `Plano comercial` promotional panels are gone.
- Pedido cards show value, title, addresses, metadata, route, and WhatsApp without crowding.

- [ ] **Step 7: Verify mobile home and pedidos visually**

Use Browser mobile viewport around `390x844` for:

```text
http://127.0.0.1:3001
http://127.0.0.1:3001/pedidos?cidade=Sao%20Paulo
```

Expected visual checks:

- City selection stacks cleanly.
- Controls stack in this order: city, radius, location, tab/sort.
- Card actions stack or fit without horizontal scrolling.
- Long labels do not overflow buttons.
- The pedidos list appears early enough in the page.

- [ ] **Step 8: Commit global polish**

Run:

```bash
git add app/globals.css
git commit -m "style: use neutral entregaapp surface"
```

Expected: a commit containing only `app/globals.css`.

---

## Final Verification

- [ ] **Step 1: Run all targeted UI tests**

Run:

```bash
npm test -- --run __tests__/delivery-ui.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS with exit code 0.

- [ ] **Step 3: Check final diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only planned files are modified or committed:

- `__tests__/delivery-ui.test.tsx`
- `components/delivery/CitySelector.tsx`
- `components/delivery/DeliveryBoard.tsx`
- `components/delivery/DeliveryRequestCard.tsx`
- `app/globals.css`

If unrelated pre-existing changes remain, leave them untouched and mention them in the final handoff.

## Self-Review Notes

- Spec coverage: home, board, cards, visual system, mobile, and verification are covered by Tasks 1-5.
- Scope control: no API, auth, billing, Prisma, or business-rule changes are included.
- Test coverage: Task 1 defines failing UI expectations before implementation; Tasks 2-4 make those expectations pass; Task 5 verifies visual behavior.
- Type consistency: no new exported types are introduced; existing props and state remain unchanged.
