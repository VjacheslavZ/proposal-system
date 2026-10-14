# Concierge Itinerary Proposal System

A lightweight tool for Exclusive Resorts concierges: build a curated itinerary for a member, send it as a proposal, and let the member review, approve and "pay" to lock it in.

Full loop: **create → send → approve → pay**.

- Concierge dashboard: `http://localhost:3000`
- Member view: `http://localhost:3000/proposal/[id]` (the link is shown in the dashboard after sending)

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
docker compose down -v           # stop and delete the database volume
```

### Option 2 — Without Docker

Requirements: Node.js 26 (see `.nvmrc`).

```bash
cp .env.example .env
npm install
npm run setup    # apply migrations + seed
npm run dev
```

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
| GET | `/api/proposals` | List proposals with status |
| GET | `/api/proposals/[id]` | Single proposal with line items |
| PATCH | `/api/proposals/[id]` | Update status (`sent`, `approved`, `paid`) |
| POST | `/api/proposals/[id]/send` | Mark as sent and log the "email" |

Errors use one format: `{ "error": { "code": "...", "message": "..." } }` with `400`, `404` or `409` status codes.

## Assumptions

- A single member and reservation are seeded: James Whitfield (`james.whitfield@example.com`) at Villa Punta Mita, Mexico, **December 15–22, 2027**. The assignment says March 15–22; the dates were moved to keep the trip in the future.
- Prices are in USD.
- Time zones are ignored: dates and times are shown exactly as the concierge entered them.
- No authentication: the dashboard is open, and the member view is reachable by its unguessable proposal ID.
- Email sending is simulated: a row in `sent_emails` plus a console log.
- Payment is simulated: the button moves the status to `paid`.
- Statuses only move forward; there is no cancel or revert.
- Draft proposals are not visible in the member view.

## What I would improve given more time

- **Time zones:** store times with a zone and display them in the villa's local time (`America/Bahia_Banderas`).
- **Status history:** `approved_at` / `paid_at` timestamps or a `proposal_status_history` table for an audit trail.
- **Cancel / revert** proposals, and expire unpaid proposals.
- Stretch goals from the assignment: a concierge note shown to the member, editing drafts, a day-by-day timeline, optimistic UI updates, animated confirmation, multiple members and reservations.
- Authentication for concierges and signed, expiring links for members.
- Real email delivery and payment provider integration.
- Automated tests (status transition rules, API route handlers, end-to-end flow).

## What I found most interesting or challenging

_To be written after implementation._

## Known issues

_None yet._

## Walkthrough

_Loom link: TBD._
