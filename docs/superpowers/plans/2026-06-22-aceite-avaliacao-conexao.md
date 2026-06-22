# Aceite, Avaliacao E Conexao Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add in-app delivery acceptance, company-to-courier review after completion, and product copy that makes EntregaApp clearly a connector between companies and couriers.

**Architecture:** Reuse `DeliveryRequest.status`, `acceptedById`, and `acceptedAt` for the acceptance state. Add a `DeliveryReview` model for one company review per completed request. Add focused API routes below `/api/delivery-requests/[id]/...`, then expose courier actions and a small company management/review area inside the existing pedidos board.

**Tech Stack:** Next.js App Router, React client components, NextAuth `auth()`, Prisma, Zod, Vitest, Testing Library.

---

## File Structure

- Modify `prisma/schema.prisma`: add delivery review relations and `DeliveryReview`.
- Modify `lib/delivery/validators.ts`: add `deliveryReviewSchema`.
- Modify `lib/delivery/shared.ts`: expose accepted/review fields for UI summaries.
- Modify `lib/delivery/requests.ts`: map accepted courier and review data; add company managed request loader.
- Create `app/api/delivery-requests/[id]/accept/route.ts`: courier accepts an open request.
- Create `app/api/delivery-requests/[id]/complete/route.ts`: owner company marks accepted request done.
- Create `app/api/delivery-requests/[id]/review/route.ts`: owner company reviews accepted courier after completion.
- Modify `components/delivery/DeliveryRequestCard.tsx`: show accept/login action while preserving WhatsApp.
- Create `components/delivery/ManagedDeliveryRequests.tsx`: company list for accepted/done requests, complete action, review form.
- Modify `components/delivery/DeliveryBoard.tsx`: pass viewer context to cards and render managed company list.
- Modify `app/pedidos/page.tsx`: load managed company requests for authenticated business users.
- Modify copy in `components/delivery/CitySelector.tsx`, `components/delivery/DeliveryBoard.tsx`, `app/(auth)/cadastro/RegisterForm.tsx`, `README.md`, and `docs/analise-webapp-entregaapp.md`.
- Modify tests in `__tests__/api-routes.test.ts`, `__tests__/delivery-validation.test.ts`, and `__tests__/delivery-ui.test.tsx`.

---

### Task 1: Schema And Review Validation

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `lib/delivery/validators.ts`
- Test: `__tests__/delivery-validation.test.ts`

- [ ] **Step 1: Write the failing validation test**

Add these imports in `__tests__/delivery-validation.test.ts`:

```ts
import { deliveryReviewSchema } from "@/lib/delivery/validators";
```

Add this test inside `describe("delivery formatting and validation", () => { ... })`:

```ts
  it("validates company review ratings and comment limits", () => {
    expect(deliveryReviewSchema.safeParse({ rating: 5, comment: "Entrega concluida no prazo." }).success).toBe(true);
    expect(deliveryReviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(deliveryReviewSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(deliveryReviewSchema.safeParse({ rating: 4, comment: "x".repeat(281) }).success).toBe(false);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:run -- __tests__/delivery-validation.test.ts
```

Expected: FAIL because `deliveryReviewSchema` is not exported.

- [ ] **Step 3: Add the Prisma review model**

In `prisma/schema.prisma`, update `User` relations:

```prisma
  deliveryRequests DeliveryRequest[] @relation("CreatedDeliveryRequests")
  acceptedDeliveryRequests DeliveryRequest[] @relation("AcceptedDeliveryRequests")
  companyDeliveryReviews DeliveryReview[] @relation("CompanyDeliveryReviews")
  courierDeliveryReviews DeliveryReview[] @relation("CourierDeliveryReviews")
```

Update `DeliveryRequest` relations:

```prisma
  createdBy User @relation("CreatedDeliveryRequests", fields: [createdById], references: [id], onDelete: Cascade)
  acceptedBy User? @relation("AcceptedDeliveryRequests", fields: [acceptedById], references: [id], onDelete: SetNull)
  review DeliveryReview?
```

Add this model after `DeliveryRequest`:

```prisma
model DeliveryReview {
  id          String @id @default(cuid())
  requestId   String @unique
  companyId   String
  courierId   String
  rating      Int
  comment     String?

  request DeliveryRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  company User @relation("CompanyDeliveryReviews", fields: [companyId], references: [id], onDelete: Cascade)
  courier User @relation("CourierDeliveryReviews", fields: [courierId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([companyId])
  @@index([courierId])
  @@index([rating])
}
```

- [ ] **Step 4: Add Zod review validation**

In `lib/delivery/validators.ts`, add:

```ts
export const deliveryReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int("Informe uma nota inteira.")
    .min(1, "A nota minima e 1.")
    .max(5, "A nota maxima e 5."),
  comment: z.string().trim().max(280, "O comentario deve ter no maximo 280 caracteres.").optional()
});

export type DeliveryReviewInput = z.infer<typeof deliveryReviewSchema>;
```

- [ ] **Step 5: Run validation test to verify it passes**

Run:

```bash
npm run test:run -- __tests__/delivery-validation.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma lib/delivery/validators.ts __tests__/delivery-validation.test.ts
git commit -m "feat: add delivery review schema"
```

---

### Task 2: Acceptance, Completion, And Review API Routes

**Files:**
- Modify: `__tests__/api-routes.test.ts`
- Create: `app/api/delivery-requests/[id]/accept/route.ts`
- Create: `app/api/delivery-requests/[id]/complete/route.ts`
- Create: `app/api/delivery-requests/[id]/review/route.ts`

- [ ] **Step 1: Write failing API tests**

Update `prismaMock` in `__tests__/api-routes.test.ts`:

```ts
const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn()
  },
  deliveryRequest: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn()
  },
  deliveryReview: {
    create: vi.fn()
  }
}));
```

Add imports:

```ts
import { POST as acceptDeliveryPost } from "@/app/api/delivery-requests/[id]/accept/route";
import { POST as completeDeliveryPost } from "@/app/api/delivery-requests/[id]/complete/route";
import { POST as reviewDeliveryPost } from "@/app/api/delivery-requests/[id]/review/route";
```

Add default mocks in `beforeEach`:

```ts
    prismaMock.deliveryRequest.findUnique.mockResolvedValue({
      id: "delivery_1",
      status: "OPEN",
      createdById: "user_business",
      acceptedById: null,
      acceptedAt: null
    });
    prismaMock.deliveryRequest.update.mockResolvedValue({ id: "delivery_1", status: "TAKEN" });
    prismaMock.deliveryReview.create.mockResolvedValue({ id: "review_1", rating: 5 });
```

Add tests:

```ts
  it("lets courier accounts accept open delivery requests", async () => {
    authMock.mockResolvedValue(courierSession);

    const response = await acceptDeliveryPost(new Request("http://localhost/api/delivery-requests/delivery_1/accept", { method: "POST" }), {
      params: Promise.resolve({ id: "delivery_1" })
    });

    expect(response.status).toBe(200);
    expect(prismaMock.deliveryRequest.update).toHaveBeenCalledWith({
      where: { id: "delivery_1" },
      data: expect.objectContaining({
        acceptedById: "user_courier",
        status: "TAKEN"
      })
    });
  });

  it("blocks companies from accepting delivery requests", async () => {
    authMock.mockResolvedValue(businessSession);

    const response = await acceptDeliveryPost(new Request("http://localhost/api/delivery-requests/delivery_1/accept", { method: "POST" }), {
      params: Promise.resolve({ id: "delivery_1" })
    });

    expect(response.status).toBe(403);
  });

  it("lets the owner company complete accepted delivery requests", async () => {
    authMock.mockResolvedValue(businessSession);
    prismaMock.deliveryRequest.findUnique.mockResolvedValue({
      id: "delivery_1",
      status: "TAKEN",
      createdById: "user_business",
      acceptedById: "user_courier"
    });

    const response = await completeDeliveryPost(new Request("http://localhost/api/delivery-requests/delivery_1/complete", { method: "POST" }), {
      params: Promise.resolve({ id: "delivery_1" })
    });

    expect(response.status).toBe(200);
    expect(prismaMock.deliveryRequest.update).toHaveBeenCalledWith({
      where: { id: "delivery_1" },
      data: { status: "DONE" }
    });
  });

  it("lets the owner company review the accepted courier after completion", async () => {
    authMock.mockResolvedValue(businessSession);
    prismaMock.deliveryRequest.findUnique.mockResolvedValue({
      id: "delivery_1",
      status: "DONE",
      createdById: "user_business",
      acceptedById: "user_courier"
    });

    const response = await reviewDeliveryPost(jsonPost("http://localhost/api/delivery-requests/delivery_1/review", {
      rating: 5,
      comment: "Entrega bem combinada."
    }), {
      params: Promise.resolve({ id: "delivery_1" })
    });

    expect(response.status).toBe(201);
    expect(prismaMock.deliveryReview.create).toHaveBeenCalledWith({
      data: {
        requestId: "delivery_1",
        companyId: "user_business",
        courierId: "user_courier",
        rating: 5,
        comment: "Entrega bem combinada."
      }
    });
  });
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test:run -- __tests__/api-routes.test.ts
```

Expected: FAIL because the new routes do not exist.

- [ ] **Step 3: Implement accept route**

Create `app/api/delivery-requests/[id]/accept/route.ts`:

```ts
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre como entregador para aceitar a entrega." }, { status: 401 });
  }

  if (session.user.role !== "COURIER") {
    return NextResponse.json({ error: "Apenas entregadores podem aceitar entregas." }, { status: 403 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Supabase ainda nao configurado." }, { status: 503 });
  }

  const { id } = await params;
  const prisma = getPrisma();
  const deliveryRequest = await prisma.deliveryRequest.findUnique({
    where: { id },
    select: { id: true, status: true, createdById: true, acceptedById: true }
  });

  if (!deliveryRequest) {
    return NextResponse.json({ error: "Pedido nao encontrado." }, { status: 404 });
  }

  if (deliveryRequest.status !== "OPEN" || deliveryRequest.acceptedById) {
    return NextResponse.json({ error: "Este pedido ja foi aceito." }, { status: 409 });
  }

  const updated = await prisma.deliveryRequest.update({
    where: { id },
    data: {
      acceptedById: session.user.id,
      acceptedAt: new Date(),
      status: "TAKEN"
    }
  });

  return NextResponse.json({ request: updated });
}
```

- [ ] **Step 4: Implement complete route**

Create `app/api/delivery-requests/[id]/complete/route.ts`:

```ts
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre como empresa para concluir o pedido." }, { status: 401 });
  }

  if (session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Apenas empresas podem concluir pedidos." }, { status: 403 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Supabase ainda nao configurado." }, { status: 503 });
  }

  const { id } = await params;
  const prisma = getPrisma();
  const deliveryRequest = await prisma.deliveryRequest.findUnique({
    where: { id },
    select: { id: true, status: true, createdById: true, acceptedById: true }
  });

  if (!deliveryRequest) {
    return NextResponse.json({ error: "Pedido nao encontrado." }, { status: 404 });
  }

  if (deliveryRequest.createdById !== session.user.id) {
    return NextResponse.json({ error: "Apenas a empresa dona do pedido pode concluir." }, { status: 403 });
  }

  if (deliveryRequest.status !== "TAKEN" || !deliveryRequest.acceptedById) {
    return NextResponse.json({ error: "Somente pedidos aceitos podem ser concluidos." }, { status: 409 });
  }

  const updated = await prisma.deliveryRequest.update({
    where: { id },
    data: { status: "DONE" }
  });

  return NextResponse.json({ request: updated });
}
```

- [ ] **Step 5: Implement review route**

Create `app/api/delivery-requests/[id]/review/route.ts`:

```ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { deliveryReviewSchema } from "@/lib/delivery/validators";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Entre como empresa para avaliar." }, { status: 401 });
    }

    if (session.user.role !== "BUSINESS") {
      return NextResponse.json({ error: "Apenas empresas podem avaliar entregadores." }, { status: 403 });
    }

    if (!hasDatabaseUrl()) {
      return NextResponse.json({ error: "Supabase ainda nao configurado." }, { status: 503 });
    }

    const { id } = await params;
    const data = deliveryReviewSchema.parse(await request.json());
    const prisma = getPrisma();
    const deliveryRequest = await prisma.deliveryRequest.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true, acceptedById: true }
    });

    if (!deliveryRequest) {
      return NextResponse.json({ error: "Pedido nao encontrado." }, { status: 404 });
    }

    if (deliveryRequest.createdById !== session.user.id) {
      return NextResponse.json({ error: "Apenas a empresa dona do pedido pode avaliar." }, { status: 403 });
    }

    if (deliveryRequest.status !== "DONE" || !deliveryRequest.acceptedById) {
      return NextResponse.json({ error: "Avalie somente depois de concluir a entrega." }, { status: 409 });
    }

    const review = await prisma.deliveryReview.create({
      data: {
        requestId: deliveryRequest.id,
        companyId: session.user.id,
        courierId: deliveryRequest.acceptedById,
        rating: data.rating,
        comment: data.comment || null
      }
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Avaliacao invalida." }, { status: 400 });
    }

    console.error("[DELIVERY_REVIEW_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Erro ao avaliar entregador." }, { status: 500 });
  }
}
```

- [ ] **Step 6: Run API tests to verify pass**

Run:

```bash
npm run test:run -- __tests__/api-routes.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add __tests__/api-routes.test.ts "app/api/delivery-requests/[id]/accept/route.ts" "app/api/delivery-requests/[id]/complete/route.ts" "app/api/delivery-requests/[id]/review/route.ts"
git commit -m "feat: add delivery accept complete review api"
```

---

### Task 3: Delivery Summaries For Accepted And Reviewed Requests

**Files:**
- Modify: `lib/delivery/shared.ts`
- Modify: `lib/delivery/requests.ts`
- Modify: `app/pedidos/page.tsx`
- Test: `__tests__/delivery-search.test.ts`

- [ ] **Step 1: Write failing summary/mapping tests**

In `__tests__/delivery-search.test.ts`, add a request with accepted/review fields and assert `searchDeliveryRequests` keeps non-OPEN requests out of public results if the fixture has `status: "TAKEN"`:

```ts
  it("does not return accepted requests in public search results", () => {
    const now = new Date("2026-06-01T12:00:00.000Z");
    const accepted = {
      ...requests[0],
      id: "accepted",
      status: "TAKEN" as const,
      acceptedById: "courier_1",
      acceptedAt: "2026-06-01T11:00:00.000Z"
    };

    const result = searchDeliveryRequests({
      city: "Sao Paulo",
      now,
      requests: [accepted],
      sort: "recentes"
    });

    expect(result).toEqual([]);
  });
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm run test:run -- __tests__/delivery-search.test.ts
```

Expected: FAIL because summary types/search do not account for status yet.

- [ ] **Step 3: Extend summary types and public filtering**

In `lib/delivery/shared.ts`, update `DeliveryRequestSummary`:

```ts
  status?: "OPEN" | "TAKEN" | "DONE" | "CANCELLED";
  acceptedById?: string | null;
  acceptedByName?: string | null;
  acceptedAt?: string | null;
  review?: {
    rating: number;
    comment?: string | null;
  } | null;
```

Update `filterVisibleDeliveryRequests`:

```ts
  return requests.filter(request => {
    const createdAt = new Date(request.createdAt).getTime();
    const isOpen = !request.status || request.status === "OPEN";
    return isOpen && Number.isFinite(createdAt) && createdAt >= cutoff;
  });
```

Set fallback requests status:

```ts
    status: "OPEN",
```

Add that field to each fallback item.

- [ ] **Step 4: Extend database mapping and managed loader**

In `lib/delivery/requests.ts`, extend `DeliveryRequestRecord`:

```ts
  status: "OPEN" | "TAKEN" | "DONE" | "CANCELLED";
  acceptedById?: string | null;
  acceptedAt?: Date | null;
  acceptedBy?: { id: string; name: string | null } | null;
  review?: { rating: number; comment: string | null } | null;
```

Update `toDeliveryRequestSummary`:

```ts
    status: request.status,
    acceptedById: request.acceptedById ?? null,
    acceptedByName: request.acceptedBy?.name ?? null,
    acceptedAt: request.acceptedAt?.toISOString() ?? null,
    review: request.review ? { rating: request.review.rating, comment: request.review.comment } : null
```

Update public `findMany` include:

```ts
    include: {
      acceptedBy: { select: { id: true, name: true } },
      review: { select: { rating: true, comment: true } },
      createdBy: {
        select: {
          companyPlan: true,
          subscriptionStatus: true
        }
      }
    },
```

Add exported company loader:

```ts
export const getCompanyManagedDeliveryRequests = cache(async (companyId?: string | null) => {
  if (!companyId || !process.env.DATABASE_URL) return [];

  const { getPrisma } = await import("@/lib/prisma");
  const prisma = getPrisma();
  const requests = await prisma.deliveryRequest.findMany({
    where: {
      createdById: companyId,
      status: { in: ["TAKEN", "DONE"] }
    },
    include: {
      acceptedBy: { select: { id: true, name: true } },
      review: { select: { rating: true, comment: true } },
      createdBy: {
        select: {
          companyPlan: true,
          subscriptionStatus: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return requests.map(toDeliveryRequestSummary);
});
```

- [ ] **Step 5: Pass managed requests from server page**

In `app/pedidos/page.tsx`, add imports:

```ts
import { auth } from "@/auth";
import { getCompanyManagedDeliveryRequests, getDeliverySearchRequests, normalizeSort } from "@/lib/delivery/requests";
```

Inside `PedidosPage`, load session and managed requests:

```ts
  const session = await auth();
  const managedRequests =
    session?.user?.role === "BUSINESS"
      ? await getCompanyManagedDeliveryRequests(session.user.id)
      : [];
```

Pass prop:

```tsx
      managedRequests={managedRequests}
```

- [ ] **Step 6: Run search tests**

Run:

```bash
npm run test:run -- __tests__/delivery-search.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/delivery/shared.ts lib/delivery/requests.ts app/pedidos/page.tsx __tests__/delivery-search.test.ts
git commit -m "feat: expose accepted delivery summaries"
```

---

### Task 4: Courier Accept Action In The Card

**Files:**
- Modify: `components/delivery/DeliveryRequestCard.tsx`
- Modify: `components/delivery/DeliveryBoard.tsx`
- Test: `__tests__/delivery-ui.test.tsx`

- [ ] **Step 1: Write failing UI tests**

In `__tests__/delivery-ui.test.tsx`, make `useSession` configurable:

```ts
const sessionMock = vi.hoisted(() => vi.fn(() => ({ data: null, status: "unauthenticated" })));

vi.mock("next-auth/react", () => ({
  useSession: () => sessionMock()
}));
```

Add beforeEach reset:

```ts
    sessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
```

Add test:

```ts
  it("shows accept delivery action for logged courier accounts", () => {
    sessionMock.mockReturnValue({
      data: { user: { id: "courier_1", role: "COURIER" } },
      status: "authenticated"
    });

    render(
      <DeliveryBoard
        city="Sao Paulo"
        requests={fallbackDeliveryRequests.filter(request => request.city === "Sao Paulo")}
        managedRequests={[]}
        sort="recentes"
      />
    );

    expect(screen.getAllByRole("button", { name: /aceitar entrega/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/o app registra o aceite/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run UI test to verify failure**

Run:

```bash
npm run test:run -- __tests__/delivery-ui.test.tsx
```

Expected: FAIL because props/action do not exist.

- [ ] **Step 3: Add props and accept action to card**

At top of `components/delivery/DeliveryRequestCard.tsx` add:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
```

Update signature:

```tsx
type DeliveryRequestCardProps = {
  request: DeliveryRequestSummary;
  loginUrl?: string;
  viewerRole?: "BUSINESS" | "COURIER" | null;
};

export function DeliveryRequestCard({ request, loginUrl = "/login", viewerRole }: DeliveryRequestCardProps) {
  const router = useRouter();
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
```

Add handler:

```tsx
  async function handleAccept() {
    setIsAccepting(true);
    setAcceptError(null);

    const response = await fetch(`/api/delivery-requests/${request.id}/accept`, { method: "POST" });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    setIsAccepting(false);

    if (!response.ok) {
      setAcceptError(payload.error ?? "Nao foi possivel aceitar a entrega.");
      return;
    }

    router.refresh();
  }
```

Add action next to route and WhatsApp:

```tsx
            {viewerRole === "COURIER" ? (
              <button
                type="button"
                onClick={handleAccept}
                disabled={isAccepting}
                className="inline-flex min-h-9 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {isAccepting ? "Aceitando..." : "Aceitar entrega"}
              </button>
            ) : viewerRole ? null : (
              <a
                href={loginUrl}
                className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                Entrar para aceitar
              </a>
            )}
```

Render error below actions:

```tsx
          {acceptError ? <p className="text-xs font-semibold text-red-600">{acceptError}</p> : null}
```

- [ ] **Step 4: Pass viewer props from board**

In `components/delivery/DeliveryBoard.tsx`, update props type:

```ts
  managedRequests?: DeliveryRequestSummary[];
```

Update function params:

```ts
export function DeliveryBoard({ city, requests, managedRequests = [], sort, initialLat, initialLng, initialRadius }: DeliveryBoardProps) {
```

Pass props:

```tsx
              <DeliveryRequestCard
                key={request.id}
                request={request}
                loginUrl={loginUrl}
                viewerRole={session?.user?.role ?? null}
              />
```

Add explanatory copy near list heading:

```tsx
              <p className="text-sm font-semibold text-slate-500">
                O app registra o aceite; os detalhes operacionais sao combinados entre empresa e entregador.
              </p>
```

- [ ] **Step 5: Run UI tests**

Run:

```bash
npm run test:run -- __tests__/delivery-ui.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/delivery/DeliveryRequestCard.tsx components/delivery/DeliveryBoard.tsx __tests__/delivery-ui.test.tsx
git commit -m "feat: add courier accept action"
```

---

### Task 5: Company Managed Requests And Review Form

**Files:**
- Create: `components/delivery/ManagedDeliveryRequests.tsx`
- Modify: `components/delivery/DeliveryBoard.tsx`
- Test: `__tests__/delivery-ui.test.tsx`

- [ ] **Step 1: Write failing UI test**

Add test in `__tests__/delivery-ui.test.tsx`:

```ts
  it("lets companies see accepted requests and review completed couriers", () => {
    sessionMock.mockReturnValue({
      data: { user: { id: "user_business", role: "BUSINESS" } },
      status: "authenticated"
    });

    render(
      <DeliveryBoard
        city="Sao Paulo"
        requests={[]}
        managedRequests={[
          {
            ...fallbackDeliveryRequests[0],
            id: "delivery_done",
            status: "DONE",
            acceptedById: "courier_1",
            acceptedByName: "Joao Entregador",
            acceptedAt: "2026-06-22T12:00:00.000Z",
            review: null
          }
        ]}
        sort="recentes"
      />
    );

    expect(screen.getByText(/entregas aceitas pela empresa/i)).toBeInTheDocument();
    expect(screen.getByText(/joao entregador/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /avaliar entregador/i })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run UI test to verify failure**

Run:

```bash
npm run test:run -- __tests__/delivery-ui.test.tsx
```

Expected: FAIL because managed request UI does not exist.

- [ ] **Step 3: Create managed requests component**

Create `components/delivery/ManagedDeliveryRequests.tsx`:

```tsx
"use client";

import { CheckCircle2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { DeliveryRequestSummary } from "@/lib/delivery/shared";

export function ManagedDeliveryRequests({ requests }: { requests: DeliveryRequestSummary[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function postAction(id: string, action: "complete" | "review", body?: unknown) {
    setMessage(null);
    const response = await fetch(`/api/delivery-requests/${id}/${action}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "Nao foi possivel atualizar o pedido.");
      return;
    }

    router.refresh();
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase text-emerald-700">Entregas aceitas pela empresa</p>
      <h2 className="mt-1 text-xl font-black text-slate-950">Acompanhe aceites e avalie entregadores</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        O EntregaApp registra o aceite e a avaliacao. O combinado operacional continua entre empresa e entregador.
      </p>
      {message ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{message}</p> : null}
      <div className="mt-4 grid gap-3">
        {requests.map(request => (
          <ManagedDeliveryRequestItem key={request.id} request={request} onPostAction={postAction} />
        ))}
      </div>
    </section>
  );
}

function ManagedDeliveryRequestItem({
  request,
  onPostAction
}: {
  request: DeliveryRequestSummary;
  onPostAction: (id: string, action: "complete" | "review", body?: unknown) => Promise<void>;
}) {
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const canComplete = request.status === "TAKEN";
  const canReview = request.status === "DONE" && !request.review;

  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-black text-slate-950">{request.title}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Entregador: {request.acceptedByName ?? "Entregador aceito"}
          </p>
          <p className="mt-1 text-xs font-bold uppercase text-slate-500">Status: {request.status}</p>
        </div>
        {canComplete ? (
          <button
            type="button"
            onClick={() => onPostAction(request.id, "complete")}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-bold text-white"
          >
            <CheckCircle2 size={15} />
            Marcar como concluida
          </button>
        ) : null}
      </div>

      {request.review ? (
        <p className="mt-3 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
          <Star size={15} />
          Avaliado com {request.review.rating}/5
        </p>
      ) : null}

      {canReview ? (
        <form
          className="mt-3 grid gap-2 sm:grid-cols-[7rem_1fr_auto]"
          onSubmit={event => {
            event.preventDefault();
            void onPostAction(request.id, "review", { rating: Number(rating), comment });
          }}
        >
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Nota
            <select
              value={rating}
              onChange={event => setRating(event.target.value)}
              className="min-h-10 rounded-md border border-slate-200 bg-white px-3"
            >
              {[5, 4, 3, 2, 1].map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Comentario
            <input
              value={comment}
              onChange={event => setComment(event.target.value)}
              maxLength={280}
              className="min-h-10 rounded-md border border-slate-200 bg-white px-3"
              placeholder="Opcional"
            />
          </label>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-bold text-white sm:self-end"
          >
            Avaliar entregador
          </button>
        </form>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 4: Render managed requests in board**

In `components/delivery/DeliveryBoard.tsx`, import:

```ts
import { ManagedDeliveryRequests } from "@/components/delivery/ManagedDeliveryRequests";
```

Render after controls and before tab content:

```tsx
        {isBusiness ? <ManagedDeliveryRequests requests={managedRequests} /> : null}
```

- [ ] **Step 5: Run UI tests**

Run:

```bash
npm run test:run -- __tests__/delivery-ui.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/delivery/ManagedDeliveryRequests.tsx components/delivery/DeliveryBoard.tsx __tests__/delivery-ui.test.tsx
git commit -m "feat: add company accepted delivery reviews"
```

---

### Task 6: Honest Connection Copy

**Files:**
- Modify: `components/delivery/CitySelector.tsx`
- Modify: `components/delivery/DeliveryBoard.tsx`
- Modify: `app/(auth)/cadastro/RegisterForm.tsx`
- Modify: `README.md`
- Modify: `docs/analise-webapp-entregaapp.md`
- Test: `__tests__/delivery-ui.test.tsx`

- [ ] **Step 1: Write failing copy test**

Add this test in `__tests__/delivery-ui.test.tsx`:

```ts
  it("positions EntregaApp as a connector instead of a delivery operator", () => {
    render(<CitySelector />);

    expect(screen.getByText(/conecta empresas e entregadores locais/i)).toBeInTheDocument();
    expect(screen.getByText(/o combinado operacional continua entre empresa e entregador/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run UI test to verify failure**

Run:

```bash
npm run test:run -- __tests__/delivery-ui.test.tsx
```

Expected: FAIL because the copy does not exist.

- [ ] **Step 3: Update home copy**

In `components/delivery/CitySelector.tsx`, replace the main paragraph under the H1 with:

```tsx
                O EntregaApp conecta empresas e entregadores locais: empresas publicam pedidos, entregadores escolhem oportunidades e o aceite fica registrado no app.
```

Replace the support paragraph with:

```tsx
                O combinado operacional continua entre empresa e entregador, com WhatsApp para alinhar detalhes e avaliacao da empresa depois da entrega.
```

Update the "Como funciona" entries:

```tsx
              ["Empresa publica", "CNPJ, WhatsApp, retirada, entrega e valor ficam claros no pedido.", MapPinned],
              ["Entregador aceita", "O aceite fica registrado no app para tirar a proposta do mural publico.", BadgeCheck],
              ["Conversa direta", "O WhatsApp ajuda no alinhamento rapido; o app nao opera pagamento nem garantia.", MessageCircle]
```

- [ ] **Step 4: Update board and registration copy**

In `components/delivery/DeliveryBoard.tsx`, replace the header paragraph with:

```tsx
                Compare valor, horario, distancia e rota. O app registra o aceite; os detalhes sao combinados entre empresa e entregador.
```

In `app/(auth)/cadastro/RegisterForm.tsx`, replace company description with:

```ts
            "Cadastre demandas com retirada, entrega, horario, valor e WhatsApp. O app conecta sua empresa a entregadores, sem operar a entrega."
```

Replace courier items:

```ts
          items: ["Filtros por valor e cidade", "Aceite registrado no app", "Contato direto no WhatsApp"]
```

- [ ] **Step 5: Update docs copy**

In `README.md`, replace the opening paragraph with:

```md
Marketplace local de conexao para entregas. Empresas com CNPJ assinam um plano, publicam pedidos por cidade e entregadores comparam valor, tempo e rota antes de aceitar no app e alinhar detalhes pelo WhatsApp. O EntregaApp registra a conexao e avaliacao, mas nao opera pagamento, garantia ou execucao da entrega.
```

In `docs/analise-webapp-entregaapp.md`, update the conclusion sentence to:

```md
O EntregaApp e uma base comercial convincente para demonstracao e piloto: empresas publicam necessidades de entrega, entregadores filtram oportunidades, aceitam no app e alinham detalhes pelo WhatsApp. O produto deve ser comunicado como ponte de conexao e registro leve, nao como operador completo da entrega.
```

- [ ] **Step 6: Run UI copy tests**

Run:

```bash
npm run test:run -- __tests__/delivery-ui.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/delivery/CitySelector.tsx components/delivery/DeliveryBoard.tsx "app/(auth)/cadastro/RegisterForm.tsx" README.md docs/analise-webapp-entregaapp.md __tests__/delivery-ui.test.tsx
git commit -m "copy: clarify entregaapp connection scope"
```

---

### Task 7: Final Verification

**Files:**
- No new implementation files.

- [ ] **Step 1: Run focused tests**

Run:

```bash
npm run test:run -- __tests__/delivery-validation.test.ts __tests__/delivery-search.test.ts __tests__/api-routes.test.ts __tests__/delivery-ui.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Generate Prisma client**

Run:

```bash
npm run db:generate
```

Expected: Prisma Client generated successfully.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: build exits 0 and lists `/api/delivery-requests/[id]/accept`, `/complete`, `/review`, and `/pedidos`.

- [ ] **Step 4: Inspect git diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only planned files changed, plus pre-existing unrelated dirty files remain untouched.
