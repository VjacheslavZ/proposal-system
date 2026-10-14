# Development Plan

Concierge Itinerary Proposal System — Full Stack Developer assessment.

**Time budget:** 5 hours (AI-assisted development).
**Scope rule:** build only what the assignment requires. Stretch goals are out of scope and are listed in the README under "What I would improve".

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js 26 (`node:26` full Debian image) | Full image ships python/make/g++, so `better-sqlite3` can compile from source if no prebuilt binary exists |
| Framework | Next.js 16 (App Router, Turbopack) | Satisfies "Next.js 14+" |
| UI | Tailwind CSS v4 + shadcn/ui, sonner for toasts | |
| Database | SQLite via Prisma 7 + `@prisma/adapter-better-sqlite3` | Prisma 7 requires a driver adapter; seed is configured in `prisma.config.ts` |
| Validation | zod | Request body validation in route handlers |
| Language | TypeScript everywhere | |

## Running

- **Recommended:** `docker compose up -d` — starts the app in dev mode with hot reload; on startup it applies migrations and runs an idempotent seed.
- **Without Docker:** `npm install && npm run setup && npm run dev`.

Docker details:
- Source code is bind-mounted into the container, so edits on the host trigger Fast Refresh.
- `node_modules` and `.next` live in anonymous volumes (Linux-built native modules must not clash with the host).
- The SQLite file lives in the named volume `db-data` mounted at `/app/data`.
- Entrypoint: `prisma generate` → `prisma migrate deploy` → `prisma db seed` → `next dev`.

## Data model

Table and column names match the assignment exactly (snake_case fields, `@@map` for plural table names).

| Table | Columns |
|---|---|
| members | id, name, email (unique) |
| reservations | id, member_id, destination, villa, arrival_date, departure_date |
| proposals | id, reservation_id, status, created_at, sent_at |
| proposal_items | id, proposal_id, category, title, description, scheduled_at, price |
| sent_emails | id, proposal_id, to_email, sent_at, body_preview |

Decisions:
- `price` is stored as an integer number of **USD cents** to avoid floating-point rounding errors.
- `status` (`draft | sent | approved | paid`) and `category` (6 values from the assignment) are Prisma enums, stored as TEXT in SQLite.
- IDs are `cuid` strings, so the member link `/proposal/[id]` cannot be guessed by incrementing a number.
- Time zones are ignored: dates and times are displayed exactly as entered.

## Proposal status flow

`draft → sent → approved → paid`

Only single forward steps are allowed; anything else returns `409 Conflict`. The rule lives in one module and is shared by `PATCH /api/proposals/[id]` and `POST /api/proposals/[id]/send`. Cancelling or reverting a status is out of scope.

## API (Next.js Route Handlers)

| Method | Path | Purpose | Errors |
|---|---|---|---|
| GET | `/api/reservations` | Member's current reservation | 404 |
| POST | `/api/proposals` | Create a draft with its line items | 400 |
| GET | `/api/proposals` | List proposals with status and total | — |
| GET | `/api/proposals/[id]` | Single proposal with line items | 404 |
| PATCH | `/api/proposals/[id]` | Update status (`sent`, `approved`, `paid`) | 400, 404, 409 |
| POST | `/api/proposals/[id]/send` | Mark as sent, write `sent_emails` row, log the email to console | 404, 409 |

Error format: `{ "error": { "code": string, "message": string } }`.

Business logic lives in `lib/services/`; both route handlers and Server Components call it, so pages do not fetch their own API over HTTP.

## Project structure

```
app/
  page.tsx                  Concierge dashboard
  proposal/[id]/page.tsx    Member view
  api/                      Route handlers
components/
  concierge/                Trip header, category picker, item form, items list, preview dialog, proposals table
  member/                   Hero, itinerary list, total, action bar, paid confirmation
  ui/                       shadcn/ui
lib/
  prisma.ts                 Prisma client singleton
  services/                 Proposal and reservation logic
  validation.ts             zod schemas
  proposal-status.ts        Status transition rules
  categories.ts             Category labels and example titles
  format.ts                 Money and date formatting
prisma/
  schema.prisma, seed.ts, migrations/
prisma.config.ts
```

## UX

**Concierge dashboard (`/`)** — efficient, clarity over decoration:
1. Trip header: member, villa, destination, arrival/departure dates, number of nights.
2. Proposal builder: pick a category card (it pre-fills an example title), then fill title, description, date/time and price. The added items are listed with a remove action and a running total.
3. Actions: **Preview** (dialog showing the member rendering), **Save draft**, **Send now** (create and send in one step).
4. Proposals table: status badge, total, created/sent dates, link to the member view, **Send** action for drafts.

**Member view (`/proposal/[id]`)** — premium feel:
- Serif headings, generous whitespace, muted palette, gradients and typography only (no photos).
- Itinerary grouped by day, category icons, prominent total.
- Actions depend on status: `sent` → **Approve**, `approved` → **Pay & Lock In**, `paid` → confirmation screen. Drafts are not visible to members (404).

## Seed data

- Member: James Whitfield, `james.whitfield@example.com`.
- Reservation: Villa Punta Mita, Mexico, **December 15–22, 2027** (the assignment says March 15–22; dates were moved by decision).

## Stages

| # | Stage | Estimate | Status |
|---|---|---|---|
| 1 | Scaffold Next.js + Tailwind + shadcn/ui, Docker Compose, verify hot reload | 0:40 | Done |
| 2 | Prisma schema, migration, seed, Prisma client | 0:30 | |
| 3 | Services, zod validation, status rules, route handlers; smoke-test with curl | 0:50 | |
| 4 | Concierge dashboard | 1:20 | |
| 5 | Member view and payment confirmation | 1:00 | |
| 6 | End-to-end check from a clean database: create → send → approve → pay | 0:20 | |
| 7 | README: run instructions, assumptions, improvements, challenges | 0:20 | |

## Out of scope

Stretch goals (notes field, editing drafts, day-by-day timeline, optimistic UI, animations, multiple members), authentication, tests, time zones, status history, cancellation. These are documented in the README.
