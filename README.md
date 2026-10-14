# Concierge Itinerary Proposal System

A lightweight tool for Exclusive Resorts concierges: build a curated itinerary for a member, send it as a proposal, and let the member review, approve and "pay" to lock it in.

Full loop: **create → send → approve → pay**.

- Concierge dashboard: http://localhost:3000
- Member view: `http://localhost:3000/proposal/[id]` — open it with **Member view** in the proposals table (it is also the link in the logged email)

## Running locally

### Option 1 — Docker (recommended)

Requirements: Docker with Docker Compose.

```bash
docker compose up -d
```

This builds the image, starts the app in development mode with hot reload, applies database migrations and seeds the database on first run (the seed is idempotent, so restarts are safe). Open http://localhost:3000.

Useful commands:

```bash
docker compose logs -f app       # follow logs (sent "emails" are printed here)
docker compose up -d --build     # rebuild after changing dependencies
docker compose restart           # restart if a code change is not picked up (see Known issues)
docker compose down              # stop the app
rm -rf data                      # reset the database (re-created and seeded on next start)
```

The SQLite database is the file `data/dev.db`, shared between Docker and the host, so you can open it in any SQLite client (DataGrip, DB Browser for SQLite, `sqlite3 data/dev.db`). Both run options use the same file.

### Option 2 — Without Docker

Requirements: Node.js 26 (see `.nvmrc`).

```bash
cp .env.example .env
npm install
npm run setup    # generate the Prisma client, apply migrations, seed
npm run dev
```

## How it works

1. **Concierge dashboard** (`/`) — the trip header shows the member, villa, destination, arrival and departure dates. The concierge picks a category card (it pre-fills an example title and a ~$500 estimate), sets the date & time and price, and adds items. **Preview** shows exactly what the member will see; then **Save draft** or **Send now**.
2. **Send** — the proposal moves to `sent`, a row is written to `sent_emails`, and the email (with the member link) is printed to the server log.
3. **Proposals table** — every proposal with destination, stay dates, status, total, created / sent times, a **View** dialog, **Send** for drafts and **Member view** for sent proposals.
4. **Member view** (`/proposal/[id]`) — a day-by-day itinerary with the total. **Approve** moves it to `approved`, **Pay & Lock In** to `paid`, which opens an animated confirmation dialog.

## Tech stack

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **SQLite** via **Prisma 7** with the `better-sqlite3` driver adapter
- **zod** for request validation
- **Node.js 26**, `node:26` Docker image

## Data model

Tables and columns follow the assignment exactly:

| Table | Columns |
|---|---|
| members | id, name, email (unique) |
| reservations | id, member_id, destination, villa, arrival_date, departure_date |
| proposals | id, reservation_id, status, created_at, sent_at |
| proposal_items | id, proposal_id, category, title, description, scheduled_at, price |
| sent_emails | id, proposal_id, to_email, sent_at, body_preview |

- `price` is an integer number of **USD cents**, which avoids floating-point rounding errors with money.
- `status` and `category` are enums with the values from the assignment.
- IDs are `cuid` strings, so a member link cannot be guessed by incrementing a number.

Status flow: `draft → sent → approved → paid`. Only single forward steps are allowed; any other transition returns `409 Conflict`.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/reservations` | Member's current reservation |
| POST | `/api/proposals` | Create a draft proposal with line items |
| GET | `/api/proposals` | List proposals with status, line items and total |
| GET | `/api/proposals/[id]` | Single proposal with line items and total |
| PATCH | `/api/proposals/[id]` | Update status (`sent`, `approved`, `paid`) |
| POST | `/api/proposals/[id]/send` | Mark as sent and log the "email" |

Errors use one format: `{ "error": { "code": "...", "message": "...", "details": [...] } }` with `400`, `404` or `409` status codes (`details` lists validation issues).

- JSON fields use the same snake_case names as the database columns; `price` is in USD cents.
- Line items must be scheduled within the stay (arrival day through departure day).
- `PATCH` with `status: "sent"` runs the same logic as `POST /send`, so an email is always recorded.

Example — create a draft, send it, approve and pay:

## Key decisions

- **App Router with a service layer.** Business logic lives in `lib/services/`. Route handlers are thin wrappers around it, and Server Components call the same functions directly instead of fetching their own API over HTTP.
- **One status rule.** `lib/proposal-status.ts` allows only the next step. Updates are conditional on the current status (`updateMany where status = current`), so two concurrent requests cannot apply the same transition twice. Sending runs in one transaction: status, `sent_at` and the `sent_emails` row.
- **Consistent errors.** `withErrorHandling` turns zod errors, `ApiError`s and unexpected failures into the same JSON shape.
- **Shared itinerary component.** The concierge preview, the table's **View** dialog and the member page render the same `Itinerary`, so the concierge sees exactly what the member will see.
- **Two visual languages.** The concierge dashboard is dense and functional (shadcn/ui, Geist). The member view uses Cormorant Garamond headings, warm stone tones, a timeline and generous whitespace; amounts use Geist so numbers line up.
- **No flicker on actions.** Mutations and `router.refresh()` run inside `useTransition`, so buttons stay pending until the refreshed data is on screen.

## Project structure

```
app/
  page.tsx                  Concierge dashboard
  proposal/[id]/            Member view and its not-found page
  api/                      Route handlers
components/
  concierge/                Trip header, category picker, item form, proposal builder, proposals table
  member/                   Hero, actions (approve / pay), confirmation dialog
  proposal/                 Itinerary, itinerary dialog, status badge (shared)
  ui/                       shadcn/ui
lib/
  services/                 Proposal and reservation logic
  proposal-status.ts        Status transition rule
  validation.ts             zod schemas
  api-errors.ts             ApiError and the route handler error wrapper
  categories.ts, format.ts, api-client.ts, prisma.ts
prisma/                     Schema, migration, seed
docs/PLAN.md                Development plan
```

## Assumptions

- A single member and reservation are seeded: James Whitfield (`james.whitfield@example.com`) at Villa Punta Mita, Mexico, **December 15–22, 2027**. The assignment says March 15–22; the dates were moved to keep the trip in the future.
- Prices are in USD. Every example activity shows a placeholder estimate of ~$500, which is pre-filled as the price when a category is picked; the concierge adjusts it per item.
- Time zones are ignored: dates and times are shown exactly as the concierge entered them. All dates are formatted in UTC, including `created_at` / `sent_at` in the proposals table.
- No authentication: the dashboard is open, and the member view is reachable by its unguessable proposal ID.
- Email sending is simulated: a row in `sent_emails` plus a console log.
- Payment is simulated: the button moves the status to `paid`.
- Statuses only move forward; there is no cancel or revert.
- Draft proposals are not visible in the member view.

## What I would improve given more time

- **Time zones:** store times with a zone and display them in the villa's local time (`America/Bahia_Banderas`).
- **Status history:** `approved_at` / `paid_at` timestamps or a `proposal_status_history` table for an audit trail.
- **Cancel / revert** proposals, and expire unpaid proposals.
- Remaining stretch goals: a concierge note shown to the member, editing drafts, optimistic UI updates, multiple members and reservations. (A day-by-day timeline and an animated payment confirmation are already in.)
- Authentication for concierges and signed, expiring links for members.
- Real email delivery and payment provider integration.
- Automated tests: the status transition rule, route handlers, and an end-to-end test of the full loop.
- A catalog of activities per category with real descriptions and estimated prices, clickable to pre-fill an item.
- A production Docker image (`next build` + `next start`); the current setup is for development only.

## What I found most interesting or challenging

- **Next.js 16 Cache Components and a synchronous database driver.** With Cache Components on, Next.js prerenders anything that does not touch request data. `better-sqlite3` is synchronous, so a query finishes during prerendering and its result would be baked into static output — the proposals list would never change after a build. Pages and parameterless `GET` handlers call `await connection()` before reading data. A related surprise: my error wrapper caught Next.js's internal prerender signal and logged it as an error, fixed with `unstable_rethrow`.
- **The data model is small, but the workflow needs care.** The interesting part was making invalid states impossible: one forward-only status rule, a conditional update to avoid races, `PATCH status: "sent"` reusing the send logic so an email is never skipped, and line items limited to the stay dates.
- **Luxury without photography.** Making the member view feel premium with typography alone took several iterations: a serif for headings, but not for numbers (Cormorant's old-style numerals made totals look misaligned); a calm "Confirmed" status instead of a transactional green "Paid"; a muted terracotta accent; and a confirmation dialog with a soft, blurred entrance.
- **Docker dev on macOS.** Hot reload through a bind mount works, but Turbopack sometimes misses files that are replaced atomically. It took a while to tell real bugs from stale builds.

## Known issues

- An unknown or draft proposal shows the "not available" page, but the HTTP status is `200`, not `404`: with Cache Components the page streams, and `notFound()` runs inside a `<Suspense>` boundary after the headers are sent.
- In Docker on macOS, Turbopack sometimes misses an edit when a file is replaced atomically (for example by an IDE's "safe write", enabled by default in JetBrains IDEs). If a change does not show up, run `docker compose restart`; if styles still look stale, clear the cache: `docker compose exec app sh -c 'rm -rf .next/*' && docker compose restart`. Turning off "safe write" in the IDE avoids it.

## Walkthrough

_Loom link: TBD._
