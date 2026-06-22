const authMock = vi.hoisted(() => vi.fn());
const authHandlersMock = vi.hoisted(() => ({
  GET: vi.fn(() => Response.json({ ok: true })),
  POST: vi.fn(() => Response.json({ ok: true }))
}));

const hasDatabaseUrlMock = vi.hoisted(() => vi.fn(() => true));
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
const getPrismaMock = vi.hoisted(() => vi.fn(() => prismaMock));

const getDeliverySearchRequestsMock = vi.hoisted(() => vi.fn());
const normalizeSortMock = vi.hoisted(() =>
  vi.fn((value: string | undefined) =>
    value === "avaliacoes" || value === "valor" || value === "tempo" || value === "distancia"
      ? value
      : "recentes"
  )
);

const stripeMock = vi.hoisted(() => ({
  customers: {
    create: vi.fn()
  },
  checkout: {
    sessions: {
      create: vi.fn()
    }
  },
  billingPortal: {
    sessions: {
      create: vi.fn()
    }
  },
  webhooks: {
    constructEvent: vi.fn()
  },
  subscriptions: {
    retrieve: vi.fn()
  }
}));
const getStripeMock = vi.hoisted(() => vi.fn(() => stripeMock));

vi.mock("@/auth", () => ({
  auth: authMock,
  handlers: authHandlersMock
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: getPrismaMock,
  hasDatabaseUrl: hasDatabaseUrlMock
}));

vi.mock("@/lib/delivery/requests", () => ({
  getDeliverySearchRequests: getDeliverySearchRequestsMock,
  normalizeSort: normalizeSortMock
}));

vi.mock("@/lib/billing/stripe", () => ({
  buildCheckoutSessionParams: vi.fn(
    ({
      appUrl,
      customerId,
      plan,
      priceId,
      userId
    }: {
      appUrl: string;
      customerId: string;
      plan: "EMPRESA" | "PATROCINADO";
      priceId: string;
      userId: string;
    }) => ({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/pedidos?assinatura=sucesso`,
      cancel_url: `${appUrl}/pedidos?assinatura=cancelada`,
      subscription_data: { metadata: { plan, userId } },
      metadata: { plan, userId }
    })
  ),
  getAppUrl: vi.fn((request?: Request) => (request ? new URL(request.url).origin : "http://localhost:3000")),
  getPlanFromStripeMetadata: vi.fn((metadata?: Record<string, string> | null) =>
    metadata?.plan === "EMPRESA" || metadata?.plan === "PATROCINADO" ? metadata.plan : null
  ),
  getPlanFromStripePriceId: vi.fn((priceId?: string | null) => {
    if (priceId === "price_empresa") return "EMPRESA";
    if (priceId === "price_patrocinado") return "PATROCINADO";
    return null;
  }),
  getStripe: getStripeMock,
  getStripePriceId: vi.fn((plan: "EMPRESA" | "PATROCINADO") =>
    plan === "EMPRESA" ? "price_empresa" : "price_patrocinado"
  ),
  mapStripeSubscriptionStatus: vi.fn((status?: string | null) => {
    if (status === "trialing") return "TRIALING";
    if (status === "active") return "ACTIVE";
    if (status === "past_due") return "PAST_DUE";
    if (status === "canceled") return "CANCELED";
    if (status === "unpaid") return "UNPAID";
    if (status === "incomplete" || status === "incomplete_expired") return "INCOMPLETE";
    return "NONE";
  }),
  unixToDate: vi.fn((value?: number | null) => (value ? new Date(value * 1000) : null))
}));

import { GET as authGet, POST as authPost } from "@/app/api/auth/[...nextauth]/route";
import { POST as checkoutPost } from "@/app/api/billing/checkout/route";
import { POST as portalPost } from "@/app/api/billing/portal/route";
import { POST as webhookPost } from "@/app/api/billing/webhook/route";
import { POST as acceptDeliveryPost } from "@/app/api/delivery-requests/[id]/accept/route";
import { POST as completeDeliveryPost } from "@/app/api/delivery-requests/[id]/complete/route";
import { POST as reviewDeliveryPost } from "@/app/api/delivery-requests/[id]/review/route";
import { GET as deliveryGet, POST as deliveryPost } from "@/app/api/delivery-requests/route";
import { POST as registerPost } from "@/app/api/register/route";

const businessSession = {
  user: {
    id: "user_business",
    name: "Mercado Central",
    email: "empresa@example.com",
    role: "BUSINESS",
    cnpj: "11.222.333/0001-81",
    cpf: "529.982.247-25",
    companyPostalCode: "36010-000",
    subscriptionStatus: "ACTIVE"
  }
};

const courierSession = {
  user: {
    id: "user_courier",
    name: "Joao Entregador",
    email: "joao@example.com",
    role: "COURIER",
    cpf: "529.982.247-25"
  }
};

function jsonPost(url: string, body: unknown, init: RequestInit = {}) {
  return new Request(url, {
    ...init,
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...init.headers
    },
    body: JSON.stringify(body)
  });
}

async function readJson(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

function validDeliveryRequestBody() {
  return {
    title: "Entrega urgente",
    city: "Sao Paulo",
    pickupAddress: "Av. Paulista, 1000",
    pickupLatitude: -23.5729,
    pickupLongitude: -46.6424,
    dropoffAddress: "Rua Augusta, 500",
    dropoffLatitude: -23.5371,
    dropoffLongitude: -46.6426,
    scheduledDate: "2026-06-01",
    scheduledTime: "14:30",
    deliveryValue: "35,00",
    estimatedMinutes: 45,
    description: "Envelope pequeno e leve",
    posterWhatsapp: "(11) 99999-8888",
    boxWidthCm: 20,
    boxHeightCm: 5,
    boxLengthCm: 30,
    boxWeightKg: 1.2
  };
}

function validRegisterBody() {
  return {
    name: "Joao Entregador",
    email: "JOAO@example.com",
    password: "Senha@123",
    confirm: "Senha@123",
    role: "COURIER",
    cpf: "529.982.247-25",
    whatsapp: "(11) 99999-8888"
  };
}

describe("API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    hasDatabaseUrlMock.mockReturnValue(true);
    authMock.mockResolvedValue(null);
    getDeliverySearchRequestsMock.mockResolvedValue([]);
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: "user_new" });
    prismaMock.user.update.mockResolvedValue({ id: "user_business" });
    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.deliveryRequest.create.mockResolvedValue({ id: "delivery_1" });
    prismaMock.deliveryRequest.findUnique.mockResolvedValue(null);
    prismaMock.deliveryRequest.update.mockResolvedValue({ id: "delivery_1" });
    prismaMock.deliveryReview.create.mockResolvedValue({ id: "review_1" });
    stripeMock.customers.create.mockResolvedValue({ id: "cus_new" });
    stripeMock.checkout.sessions.create.mockResolvedValue({ url: "https://checkout.stripe.test/session" });
    stripeMock.billingPortal.sessions.create.mockResolvedValue({ url: "https://billing.stripe.test/session" });
    stripeMock.webhooks.constructEvent.mockReturnValue({ type: "ping", data: { object: {} } });
    stripeMock.subscriptions.retrieve.mockResolvedValue({
      id: "sub_123",
      status: "active",
      trial_end: 1_800_000_000,
      metadata: { plan: "EMPRESA" },
      items: { data: [{ price: { id: "price_empresa" } }] }
    });
  });

  it("exposes NextAuth GET and POST handlers", () => {
    expect(authGet).toBe(authHandlersMock.GET);
    expect(authPost).toBe(authHandlersMock.POST);
  });

  it("searches delivery requests by city, radius and location", async () => {
    getDeliverySearchRequestsMock.mockResolvedValue([{ id: "delivery_1" }]);

    const response = await deliveryGet(
      new Request("http://localhost/api/delivery-requests?cidade=Campinas&lat=-22.90&lng=-47.06&raio=12&ordenar=distancia")
    );

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ requests: [{ id: "delivery_1" }] });
    expect(getDeliverySearchRequestsMock).toHaveBeenCalledWith({
      city: "Campinas",
      coordinates: { latitude: -22.9, longitude: -47.06 },
      radiusKm: 12,
      sort: "distancia"
    });
  });

  it("requires login before creating a delivery request", async () => {
    const response = await deliveryPost(jsonPost("http://localhost/api/delivery-requests", validDeliveryRequestBody()));

    expect(response.status).toBe(401);
    expect(prismaMock.deliveryRequest.create).not.toHaveBeenCalled();
  });

  it("creates delivery requests only for active business accounts", async () => {
    authMock.mockResolvedValue(businessSession);

    const response = await deliveryPost(jsonPost("http://localhost/api/delivery-requests", validDeliveryRequestBody()));

    expect(response.status).toBe(201);
    expect(prismaMock.deliveryRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        city: "Sao Paulo",
        createdById: "user_business",
        deliveryValueCents: 3500,
        pickupLatitude: -23.5729,
        pickupLongitude: -46.6424,
        posterWhatsapp: "11999998888"
      })
    });
  });

  it("rejects delivery publishing from courier accounts", async () => {
    authMock.mockResolvedValue(courierSession);

    const response = await deliveryPost(jsonPost("http://localhost/api/delivery-requests", validDeliveryRequestBody()));

    expect(response.status).toBe(403);
    expect(prismaMock.deliveryRequest.create).not.toHaveBeenCalled();
  });

  it("lets a courier accept an open delivery inside the app", async () => {
    authMock.mockResolvedValue(courierSession);
    prismaMock.deliveryRequest.findUnique.mockResolvedValue({
      id: "delivery_1",
      status: "OPEN",
      acceptedById: null
    });
    prismaMock.deliveryRequest.update.mockResolvedValue({
      id: "delivery_1",
      status: "TAKEN",
      acceptedById: "user_courier"
    });

    const response = await acceptDeliveryPost(
      new Request("http://localhost/api/delivery-requests/delivery_1/accept", { method: "POST" }),
      { params: Promise.resolve({ id: "delivery_1" }) }
    );

    expect(response.status).toBe(200);
    expect(prismaMock.deliveryRequest.update).toHaveBeenCalledWith({
      where: { id: "delivery_1" },
      data: expect.objectContaining({
        acceptedById: "user_courier",
        status: "TAKEN"
      })
    });
  });

  it("lets the business mark an accepted delivery as completed", async () => {
    authMock.mockResolvedValue(businessSession);
    prismaMock.deliveryRequest.findUnique.mockResolvedValue({
      id: "delivery_1",
      createdById: "user_business",
      acceptedById: "user_courier",
      status: "TAKEN"
    });

    const response = await completeDeliveryPost(
      new Request("http://localhost/api/delivery-requests/delivery_1/complete", { method: "POST" }),
      { params: Promise.resolve({ id: "delivery_1" }) }
    );

    expect(response.status).toBe(200);
    expect(prismaMock.deliveryRequest.update).toHaveBeenCalledWith({
      where: { id: "delivery_1" },
      data: { status: "DONE" }
    });
  });

  it("lets the business review the courier after completion", async () => {
    authMock.mockResolvedValue(businessSession);
    prismaMock.deliveryRequest.findUnique.mockResolvedValue({
      id: "delivery_1",
      createdById: "user_business",
      acceptedById: "user_courier",
      status: "DONE",
      review: null
    });

    const response = await reviewDeliveryPost(
      jsonPost("http://localhost/api/delivery-requests/delivery_1/review", {
        rating: 5,
        comment: "Entrega concluida no horario combinado."
      }),
      { params: Promise.resolve({ id: "delivery_1" }) }
    );

    expect(response.status).toBe(201);
    expect(prismaMock.deliveryReview.create).toHaveBeenCalledWith({
      data: {
        requestId: "delivery_1",
        companyId: "user_business",
        courierId: "user_courier",
        rating: 5,
        comment: "Entrega concluida no horario combinado."
      }
    });
  });

  it("returns a setup error when registration has no database", async () => {
    hasDatabaseUrlMock.mockReturnValue(false);

    const response = await registerPost(jsonPost("http://localhost/api/register", validRegisterBody()));

    expect(response.status).toBe(503);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("creates a normalized courier account on registration", async () => {
    const response = await registerPost(jsonPost("http://localhost/api/register", validRegisterBody()));

    expect(response.status).toBe(201);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: "joao@example.com" } });
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "joao@example.com",
        role: "COURIER",
        cpf: "52998224725",
        whatsapp: "11999998888"
      })
    });
    expect((prismaMock.user.create.mock.calls[0]?.[0].data.password as string).length).toBeGreaterThan(20);
  });

  it("blocks checkout for non-business accounts", async () => {
    authMock.mockResolvedValue(courierSession);

    const response = await checkoutPost(jsonPost("http://localhost/api/billing/checkout", { plan: "EMPRESA" }));

    expect(response.status).toBe(403);
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("creates a Stripe checkout session for business plans", async () => {
    authMock.mockResolvedValue(businessSession);
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_business",
      name: "Mercado Central",
      email: "empresa@example.com",
      stripeCustomerId: null
    });

    const response = await checkoutPost(jsonPost("http://localhost/api/billing/checkout", { plan: "EMPRESA" }));

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ url: "https://checkout.stripe.test/session" });
    expect(stripeMock.customers.create).toHaveBeenCalledWith({
      email: "empresa@example.com",
      name: "Mercado Central",
      metadata: { userId: "user_business" }
    });
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_new",
        line_items: [{ price: "price_empresa", quantity: 1 }]
      })
    );
  });

  it("opens the Stripe billing portal for users with a Stripe customer", async () => {
    authMock.mockResolvedValue(businessSession);
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_business", stripeCustomerId: "cus_existing" });

    const response = await portalPost(new Request("http://localhost/api/billing/portal", { method: "POST" }));

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ url: "https://billing.stripe.test/session" });
    expect(stripeMock.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: "cus_existing",
      return_url: "http://localhost/pedidos?assinatura=portal"
    });
  });

  it("rejects Stripe webhooks without a signature", async () => {
    const response = await webhookPost(new Request("http://localhost/api/billing/webhook", { method: "POST" }));

    expect(response.status).toBe(400);
    expect(stripeMock.webhooks.constructEvent).not.toHaveBeenCalled();
  });

  it("updates a business subscription from Stripe checkout webhooks", async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userId: "user_business", plan: "EMPRESA" },
          subscription: "sub_123",
          customer: "cus_existing"
        }
      }
    });

    const response = await webhookPost(
      new Request("http://localhost/api/billing/webhook", {
        method: "POST",
        headers: { "stripe-signature": "sig_test" },
        body: JSON.stringify({ id: "evt_123" })
      })
    );

    expect(response.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user_business" },
      data: expect.objectContaining({
        companyPlan: "EMPRESA",
        subscriptionStatus: "ACTIVE",
        stripeCustomerId: "cus_existing",
        stripeSubscriptionId: "sub_123",
        stripePriceId: "price_empresa"
      })
    });
  });
});
