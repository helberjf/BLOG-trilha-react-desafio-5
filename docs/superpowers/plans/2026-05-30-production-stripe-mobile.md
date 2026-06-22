# EntregaApp Production Stripe Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make EntregaApp production-oriented with company subscriptions through Stripe, sponsored ordering, and mobile-first commercial flows.

**Architecture:** Business accounts require an active Stripe-backed subscription to publish delivery requests. Stripe Checkout creates subscriptions for two products, webhooks update the user subscription fields, and request listing sorts sponsored companies first. UI remains App Router based, with server APIs for billing and delivery writes and compact mobile-first client components.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Prisma 7, NextAuth v5, Stripe Billing + Checkout Sessions, Zod, React Hook Form, Tailwind CSS 4, Vitest.

---

## File Structure

- Modify `prisma/schema.prisma`: add company plan/status enums, Stripe identifiers, accepted delivery relation, and request status metadata.
- Create `lib/billing/plans.ts`: single source of truth for Empresa and Patrocinado plan definitions.
- Create `lib/billing/stripe.ts`: lazy Stripe client, checkout session creation, webhook verification helpers, and subscription status mapping.
- Create `app/api/billing/checkout/route.ts`: authenticated business checkout endpoint.
- Create `app/api/billing/portal/route.ts`: authenticated customer portal endpoint.
- Create `app/api/billing/webhook/route.ts`: Stripe webhook endpoint that updates subscription fields.
- Modify `lib/delivery/permissions.ts`: require an active/trialing paid plan for business publishing.
- Modify `lib/delivery/shared.ts` and `lib/delivery/requests.ts`: expose sponsored metadata and sort sponsored requests first.
- Modify delivery UI components: add pricing, sponsored labels, subscription gates, and mobile-first layout tightening.
- Modify auth registration UI: point business users to plan selection after account creation.
- Modify docs/env: document Stripe env vars and go-live checklist.
- Add/update tests under `__tests__/`.

## Task 1: Billing Domain Tests

- [ ] Add tests for the two plans: `EMPRESA` costs 3590 cents with 60 trial days; `PATROCINADO` costs 6990 cents with no trial.
- [ ] Add tests that business users can publish only when subscription status is `TRIALING` or `ACTIVE`.
- [ ] Add tests that sponsored requests sort before non-sponsored requests.
- [ ] Run the targeted tests and confirm they fail before implementation.

## Task 2: Billing Domain Implementation

- [ ] Add plan/status enums and Stripe fields to `prisma/schema.prisma`.
- [ ] Implement `lib/billing/plans.ts`.
- [ ] Update permission and request sorting helpers.
- [ ] Run targeted tests and confirm they pass.

## Task 3: Stripe API Layer

- [ ] Add `stripe` dependency.
- [ ] Implement lazy server-only Stripe client using env vars.
- [ ] Implement checkout route with `mode: "subscription"` and `trial_period_days: 60` only for the Empresa plan.
- [ ] Implement portal route for customer self-service.
- [ ] Implement webhook handling for checkout completion and subscription updates/deletes.
- [ ] Add tests for env validation and checkout payload construction where possible without external network calls.

## Task 4: Mobile-First Commercial UI

- [ ] Add a two-plan pricing section on the home/cadastro flow.
- [ ] Gate publishing for businesses without active subscription and route them to plan checkout.
- [ ] Show sponsored labels on cards and ensure sponsored cards appear first.
- [ ] Remove fixed/fake commercial metrics or clearly mark them as examples.
- [ ] Tighten mobile spacing, CTA stacking, form widths, and touch targets.
- [ ] Update UI tests for mobile-first copy, plan cards, gated publishing, and sponsored labels.

## Task 5: Production Verification

- [ ] Update `.env.example` and README with Stripe keys, price IDs, webhook secret, and deployment checklist.
- [ ] Run `npm run test:run`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Report remaining production prerequisites: configured Stripe products/prices, webhook endpoint, database migration, auth secret, app URL, and Supabase connection.
