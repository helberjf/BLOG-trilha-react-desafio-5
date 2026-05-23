# Entregador App Design

## Goal

Transform the cloned blog challenge into **Entregador**, a city-based delivery request board where businesses publish delivery needs and motoboys can quickly find jobs and contact the requester through WhatsApp.

## Product Scope

The app will support three public flows:

- Choose a city before browsing requests.
- View delivery requests for the selected city, sorted by newest, rating, delivery value, or estimated delivery time.
- Open a WhatsApp conversation with the person who posted the request.

The app will support three authenticated flows:

- Register and choose an account type: `Empresario` or `Entregador`.
- Log in with email and password using NextAuth credentials and `bcryptjs`.
- Create a delivery request only when logged in as `Empresario` with a valid CNPJ stored on the account.

`Entregador` users can browse and contact requesters, but cannot publish delivery requests.

## Technology Stack

The project will be updated to match the modern stack used by `Ecommerce-agenda-nextauth-nextjs-prisma`:

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7
- Supabase Postgres through `DATABASE_URL`
- NextAuth v5 credentials provider
- `bcryptjs` for password hashing and comparison
- Zod for validation
- React Hook Form for forms
- Vitest and Testing Library for tests
- Lucide React for interface icons

The existing Next 12 Pages Router blog template will be replaced rather than gradually adapted, because the requested authentication, API routes, Prisma integration, and UI patterns fit the App Router stack better.

## Information Architecture

Routes:

- `/` - city selection and app introduction.
- `/pedidos` - request board filtered by `cidade` query string.
- `/login` - login page.
- `/cadastro` - account creation page with account type select.
- `/api/auth/[...nextauth]` - NextAuth handler.
- `/api/register` - user registration.
- `/api/delivery-requests` - list and create delivery requests.

The main board will contain two tabs:

- `Pedidos` - list of request cards and sorting controls.
- `Novo pedido` - full-page form for publishing a request.

The same request form will also be available in a modal opened by the primary `Novo pedido` button.

## Data Model

Prisma models:

- `User`
  - `id`
  - `name`
  - `email`
  - `password`
  - `role`: `BUSINESS` or `COURIER`
  - `cnpj`
  - `whatsapp`
  - `createdAt`
  - `updatedAt`

- `Account`, `Session`, `VerificationToken`
  - Standard NextAuth adapter models.

- `DeliveryRequest`
  - `id`
  - `title`
  - `city`
  - `pickupAddress`
  - `dropoffAddress`
  - `scheduledDate`
  - `scheduledTime`
  - `deliveryValueCents`
  - `estimatedMinutes`
  - `description`
  - `posterWhatsapp`
  - `posterName`
  - `rating`
  - `status`: `OPEN`, `TAKEN`, `DONE`, `CANCELLED`
  - `createdById`
  - `createdAt`
  - `updatedAt`

`rating` starts as a numeric field so sorting by rating works in the MVP. A future review workflow can replace it with a normalized review table.

## Permissions

- Anonymous users can choose a city, browse requests, sort requests, and open WhatsApp links.
- Logged-in `COURIER` users can do the same as anonymous users.
- Logged-in `BUSINESS` users can create requests only when their account has a valid CNPJ.
- The server will enforce creation permissions in `/api/delivery-requests`; the UI will also hide or disable creation entry points for users who cannot post.

## UI Design

The visual direction is **portfolio editorial adapted for an operations marketplace**:

- Clear brand signal: **Entregador**.
- Dense but readable request cards built for scanning.
- Restrained palette with dark text, neutral surfaces, and action accents for WhatsApp and posting.
- First screen prioritizes choosing a city and seeing recent market activity.
- Board screen prioritizes filters, sort controls, and high-value request details.

Request cards will show:

- Pickup and dropoff locations.
- Date and time.
- Delivery value in BRL.
- Estimated delivery time.
- Requester name.
- City.
- Rating.
- WhatsApp action button.

## Form Design

Registration form fields:

- Name
- Email
- Password
- Account type select: `Empresario` or `Entregador`
- CNPJ, required only for `Empresario`
- WhatsApp

Delivery request form fields:

- Title
- City
- Pickup address
- Dropoff address
- Date
- Time
- Delivery value
- Estimated time in minutes
- Description
- WhatsApp contact

The modal form and tab form will share the same component and validation schema.

## Data Flow

Board loading:

1. User chooses city on `/`.
2. App navigates to `/pedidos?cidade=<city>`.
3. Server component loads requests from Prisma using the selected city and sort option.
4. Client controls update the query string for sorting.

Request creation:

1. User submits the shared request form from modal or tab.
2. Client validates with Zod through React Hook Form.
3. API route verifies the authenticated session.
4. API route checks `role === BUSINESS` and valid CNPJ.
5. Prisma writes the `DeliveryRequest`.
6. UI refreshes the board and shows the new request.

Authentication:

1. `/api/register` hashes passwords with `bcryptjs`.
2. NextAuth credentials provider compares submitted password with the stored hash.
3. JWT/session callbacks expose `id`, `role`, and `cnpj` status to the UI.

## Error Handling

- Registration returns clear validation errors for invalid email, weak password, missing CNPJ for business accounts, invalid CNPJ, and duplicate email.
- Login returns a generic invalid credentials error.
- Delivery creation returns:
  - `401` when not logged in.
  - `403` when the user is not a business account or has no valid CNPJ.
  - `400` for invalid request data.
- The board shows an empty state when no requests exist for a city.
- The request form preserves entered values when server validation fails.

## Testing Strategy

Tests will cover:

- CNPJ validation.
- Registration schema for business and courier users.
- Request creation permission rules.
- Sorting logic for newest, rating, value, and estimated time.
- WhatsApp URL formatting.
- Rendering of city selection, request cards, and create-request form states.

## Out Of Scope For This Iteration

- Real-time request updates.
- Taking or completing a delivery.
- Payment processing.
- Admin dashboard.
- Full rating/review submission workflow.
- Google OAuth.
