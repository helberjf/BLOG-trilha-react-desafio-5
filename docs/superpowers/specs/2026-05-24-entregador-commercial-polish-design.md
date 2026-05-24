# Entregador Commercial Polish Design

## Goal

Make Entregador feel like a commercial local-delivery marketplace, not only a functional MVP.

## Approved Direction

The product positioning is: **a local marketplace where businesses publish delivery demand and couriers choose jobs by city, value, urgency, and requester reputation.**

## Scope

The polish will update the current app without changing the database model:

- Home page with stronger commercial headline and segmented CTAs for businesses and couriers.
- Trust/value sections explaining verified businesses, CNPJ requirement, WhatsApp contact, ranking, and highlighted orders.
- A visible commercial model: free publishing plus paid highlighted requests.
- Board screen with city metrics, commercial filters, operational sidebar, and more professional request context.
- Registration form with benefit copy that changes according to selected account type.
- Remove local runtime friction observed in browser verification by documenting and providing a development `AUTH_SECRET`.

## UI Requirements

- Keep the app utilitarian and marketplace-oriented.
- Avoid a landing page that hides the actual product; the city selector and live requests remain in the first viewport.
- Use dense but readable sections, clear CTAs, and compact proof points.
- Keep cards at small radius and avoid nested-card clutter.
- Make commercial value visible without implementing payment yet.

## Verification

- Update UI tests to assert the new commercial copy and registration benefits.
- Verify home, board, and registration visually with `agent-browser`.
- Run lint, tests, and build.
