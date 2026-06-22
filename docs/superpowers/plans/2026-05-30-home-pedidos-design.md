# Home And Pedidos Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the EntregaApp home and authenticated pedidos experience so the product feels commercial, mobile-first, and closer to production without changing core delivery or billing behavior.

**Architecture:** Keep the existing Next.js App Router structure and refine the existing client components instead of adding a new design system. `CitySelector` remains the functional home; `DeliveryBoard` remains the operational pedidos panel; `DeliveryRequestCard` remains the repeated order item.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind CSS, lucide-react, Vitest, Testing Library.

---

### Task 1: Design Regression Tests

**Files:**
- Modify: `__tests__/delivery-ui.test.tsx`

- [ ] **Step 1: Add expectations for the improved home**

Add assertions to the city selection test for the commercial hero, audience lanes, and dashboard preview:

```tsx
expect(screen.getByText(/operacao local/i)).toBeInTheDocument();
expect(screen.getByText(/para empresas/i)).toBeInTheDocument();
expect(screen.getByText(/para entregadores/i)).toBeInTheDocument();
expect(screen.getByText(/mural ao vivo/i)).toBeInTheDocument();
```

- [ ] **Step 2: Add expectations for the improved pedidos panel**

Add assertions to the board test for the product panel header and route controls:

```tsx
expect(screen.getByText(/painel operacional/i)).toBeInTheDocument();
expect(screen.getByText(/rotas disponiveis/i)).toBeInTheDocument();
expect(screen.getByText(/publicacao comercial/i)).toBeInTheDocument();
expect(screen.getByText(/fila de oportunidades/i)).toBeInTheDocument();
```

- [ ] **Step 3: Run focused tests to verify RED**

Run: `npm run test:run -- __tests__/delivery-ui.test.tsx`

Expected: FAIL because the new design labels are not rendered yet.

### Task 2: Home Visual Refinement

**Files:**
- Modify: `components/delivery/CitySelector.tsx`

- [ ] **Step 1: Keep the city search as the primary first-screen action**

Maintain the existing form controls and accessible names: city select, `Usar minha localizacao`, and `Ver pedidos`.

- [ ] **Step 2: Add production-grade commercial context**

Add visible sections with these strings so the experience is testable:

```tsx
"Operacao local"
"Para empresas"
"Para entregadores"
"Mural ao vivo"
```

- [ ] **Step 3: Preserve billing CTAs**

Keep both `/cadastro?tipo=empresa` and `/cadastro?tipo=entregador` links and keep `PricingPlans compact` visible on mobile and desktop.

### Task 3: Pedidos Panel Visual Refinement

**Files:**
- Modify: `components/delivery/DeliveryBoard.tsx`
- Modify: `components/delivery/DeliveryRequestCard.tsx`

- [ ] **Step 1: Improve the board header**

Add a dashboard-style header with these strings:

```tsx
"Painel operacional"
"Rotas disponiveis"
"Publicacao comercial"
```

- [ ] **Step 2: Improve list hierarchy**

Add a visible list heading:

```tsx
"Fila de oportunidades"
```

Keep sorting, radius filter, pagination, and new-request behavior unchanged.

- [ ] **Step 3: Improve request cards**

Keep existing labels and links while improving layout hierarchy for value, route, schedule, company, and WhatsApp CTA.

### Task 4: Verification

**Files:**
- Test: `__tests__/delivery-ui.test.tsx`

- [ ] **Step 1: Run focused tests**

Run: `npm run test:run -- __tests__/delivery-ui.test.tsx`

Expected: PASS.

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run test:run
npm run lint
npm run build
```

Expected: all commands exit 0.
