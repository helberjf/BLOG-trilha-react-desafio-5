# Entregador App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Next 12 blog template with **Entregador**, a modern Next.js app where businesses with CNPJ publish delivery requests and motoboys browse city-based jobs.

**Architecture:** Use Next.js App Router with server-rendered pages for city/request browsing and API routes for registration and delivery request creation. Prisma models represent users and requests, with NextAuth credentials sessions for authenticated posting. UI is split into focused client components for forms, tabs, sorting, and modal behavior.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 7, Supabase Postgres, NextAuth v5, bcryptjs, Zod, React Hook Form, Vitest, Testing Library, Lucide React.

---

## File Structure

- Replace root config: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`.
- Remove legacy template files: `pages/**`, old `components/**`, `styles/**`, `utils/**`, `themes.js`, `tailwind.config.js`, `postcss.config.js`, Cypress and Netlify-only files.
- Create app shell: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/pedidos/page.tsx`, auth pages, API routes.
- Create auth and database modules: `auth.ts`, `lib/prisma.ts`, `lib/auth/validation.ts`, `types/next-auth.d.ts`.
- Create delivery domain modules: `lib/delivery/*`, `components/delivery/*`.
- Create Prisma schema: `prisma/schema.prisma`.
- Create tests: `__tests__/*.test.ts`, `__tests__/*.test.tsx`, `__tests__/setup.ts`.

## Task 1: Modern Project Shell

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `__tests__/setup.ts`
- Delete legacy template files that conflict with App Router.

- [ ] **Step 1: Write baseline config test**

Create `__tests__/config.test.ts`:

```ts
import packageJson from "../package.json";

describe("project stack", () => {
  it("uses the modern Entregador stack", () => {
    expect(packageJson.dependencies.next).toContain("16");
    expect(packageJson.dependencies.react).toContain("19");
    expect(packageJson.dependencies["next-auth"]).toBeDefined();
    expect(packageJson.dependencies["@prisma/client"]).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- --run __tests__/config.test.ts`

Expected: fail before package modernization because scripts/dependencies are not configured for Vitest and modern stack.

- [ ] **Step 3: Replace config and dependencies**

Update the project to modern Next.js/React/Prisma/NextAuth scripts and config files.

- [ ] **Step 4: Install dependencies**

Run: `npm install`

Expected: dependencies install and `package-lock.json` updates.

- [ ] **Step 5: Run config test**

Run: `npm test -- --run __tests__/config.test.ts`

Expected: pass.

## Task 2: Prisma Domain Model

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Create: `lib/delivery/validators.ts`
- Create: `lib/delivery/format.ts`
- Test: `__tests__/delivery-validation.test.ts`

- [ ] **Step 1: Write failing validation tests**

Test CNPJ normalization/validation, WhatsApp URL formatting, and request value conversion.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- --run __tests__/delivery-validation.test.ts`

Expected: fail because delivery utilities do not exist yet.

- [ ] **Step 3: Add Prisma schema**

Define `UserRole`, `DeliveryRequestStatus`, `User`, `Account`, `Session`, `VerificationToken`, and `DeliveryRequest`.

- [ ] **Step 4: Add lazy Prisma helper**

Create a build-safe `getPrisma()` helper that only initializes when `DATABASE_URL` is present and requested.

- [ ] **Step 5: Add delivery utility implementations**

Implement CNPJ validation, WhatsApp normalization, BRL cents conversion, and delivery request schemas with Zod.

- [ ] **Step 6: Run validation tests**

Run: `npm test -- --run __tests__/delivery-validation.test.ts`

Expected: pass.

## Task 3: Authentication

**Files:**
- Create: `auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `app/api/register/route.ts`
- Create: `lib/auth/validation.ts`
- Create: `types/next-auth.d.ts`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/login/LoginForm.tsx`
- Create: `app/(auth)/cadastro/page.tsx`
- Create: `app/(auth)/cadastro/RegisterForm.tsx`
- Test: `__tests__/auth-validation.test.ts`

- [ ] **Step 1: Write failing auth validation tests**

Cover business users requiring CNPJ, courier users not requiring CNPJ, invalid CNPJ, and password minimum rules.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- --run __tests__/auth-validation.test.ts`

Expected: fail because auth validation does not exist yet.

- [ ] **Step 3: Implement auth schemas**

Create Zod schemas for login and registration with `BUSINESS` and `COURIER` account types.

- [ ] **Step 4: Implement NextAuth credentials**

Copy and simplify the credentials/bcryptjs pattern from `Ecommerce-agenda-nextauth-nextjs-prisma`, using Prisma when `DATABASE_URL` is configured.

- [ ] **Step 5: Implement register API**

Hash passwords with `bcryptjs`, reject duplicate emails, and require valid CNPJ for business accounts.

- [ ] **Step 6: Implement login/register pages**

Create accessible forms with React Hook Form and clear Portuguese labels.

- [ ] **Step 7: Run auth tests**

Run: `npm test -- --run __tests__/auth-validation.test.ts`

Expected: pass.

## Task 4: Delivery Request Board

**Files:**
- Create: `lib/delivery/requests.ts`
- Create: `app/page.tsx`
- Create: `app/pedidos/page.tsx`
- Create: `app/api/delivery-requests/route.ts`
- Create: `components/delivery/CitySelector.tsx`
- Create: `components/delivery/DeliveryBoard.tsx`
- Create: `components/delivery/DeliveryRequestCard.tsx`
- Create: `components/delivery/DeliveryRequestForm.tsx`
- Create: `components/delivery/NewRequestDialog.tsx`
- Test: `__tests__/delivery-sorting.test.ts`
- Test: `__tests__/delivery-permissions.test.ts`
- Test: `__tests__/delivery-ui.test.tsx`

- [ ] **Step 1: Write failing sorting and permission tests**

Cover newest, rating, value, estimated time, anonymous view access, courier denial for create, and business+CNPJ allow for create.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- --run __tests__/delivery-sorting.test.ts __tests__/delivery-permissions.test.ts`

Expected: fail because request helpers do not exist yet.

- [ ] **Step 3: Implement request data helpers**

Add seeded fallback requests when `DATABASE_URL` is not set and Prisma-backed queries when it is set.

- [ ] **Step 4: Implement API route**

Create `GET` and `POST` route handlers for delivery requests, enforcing session, role, and CNPJ permissions on POST.

- [ ] **Step 5: Implement city and board pages**

Build `/` city selection and `/pedidos` board with query-string sorting.

- [ ] **Step 6: Implement request cards and shared form**

Use the same form in a modal and the `Novo pedido` tab.

- [ ] **Step 7: Run delivery tests**

Run: `npm test -- --run __tests__/delivery-sorting.test.ts __tests__/delivery-permissions.test.ts __tests__/delivery-ui.test.tsx`

Expected: pass.

## Task 5: App Polish And Verification

**Files:**
- Modify: `README.md`
- Create: `.env.example`
- Review all created `*.tsx` files.

- [ ] **Step 1: Add README and env docs**

Document setup, Supabase env vars, auth secret, Prisma push, test, build, and dev commands.

- [ ] **Step 2: Run full test suite**

Run: `npm test -- --run`

Expected: all tests pass.

- [ ] **Step 3: Run Prisma generate**

Run: `npx prisma generate`

Expected: Prisma client generation succeeds.

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: build succeeds without requiring Supabase env vars by falling back to seeded public data.

- [ ] **Step 5: Start dev server**

Run: `npm run dev`

Expected: local server starts and the app is available for browser verification.
