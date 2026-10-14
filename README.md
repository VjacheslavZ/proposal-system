Built with Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4 + shadcn/ui, Prisma 7 + SQLite (`better-sqlite3`), zod and Node.js 26.

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

## Assumptions

- A single member and reservation are seeded: James Whitfield (`james.whitfield@example.com`) at Villa Punta Mita, Mexico, **December 15–22, 2027**. The assignment says March 15–22; the dates were moved to keep the trip in the future.
- Prices are in USD. Every example activity shows a placeholder estimate of ~$500, which is pre-filled as the price when a category is picked; the concierge adjusts it per item.
- Time zones are ignored: dates and times are shown exactly as the concierge entered them. All dates are formatted in UTC, including `created_at` / `sent_at` in the proposals table.
- No authentication: the dashboard is open, and the member view is reachable by its unguessable proposal ID.
- Email sending is simulated: a row in `sent_emails` plus a console log.
- Payment is simulated: the button moves the status to `paid`.
- Statuses only move forward; there is no cancel or revert.
- Draft proposals are not visible in the member view.
- A saved draft cannot be edited — it can only be sent (editing drafts is a stretch goal).
- The "current reservation" is the nearest upcoming or ongoing one (`departure_date` is today or later).
- A reservation can have several proposals; each has its own member link.
- Line items must fall within the stay, from the arrival day through the departure day.
- Categories are the fixed list from the assignment (an enum), not an editable catalog.

## What I would improve given more time

- **Time zones:** store times with a zone and display them in the villa's local time (`America/Bahia_Banderas`).
- **Status history:** `approved_at` / `paid_at` timestamps or a `proposal_status_history` table for an audit trail.
- **Cancel / revert** proposals, and expire unpaid proposals.
- **Clearer validation messages:** show errors inline next to each form field and replace generic zod messages (e.g. "Invalid ISO datetime", "expected int, received number") with human-readable ones.
- **End time for activities:** an optional end time or duration — required for experiences that span time (spa treatment, sailing charter), optional for point-in-time ones (airport pickup, restaurant reservation).
- **Overlap validation:** warn the concierge when items overlap in time (needs the end time above); today only the stay dates are checked.
- Remaining stretch goals: a concierge note shown to the member, editing drafts, optimistic UI updates, multiple members and reservations.
- Authentication for concierges and signed, expiring links for members.
- Real email delivery and payment provider integration.
- Automated tests: the status transition rule, route handlers, and an end-to-end test of the full loop.
- A catalog of activities per category with real descriptions and estimated prices, clickable to pre-fill an item.
- A production Docker image (`next build` + `next start`); the current setup is for development only.

## What I found most interesting or challenging

- **Next.js 16 Cache Components and a synchronous database driver.** With Cache Components on, Next.js prerenders anything that does not touch request data. `better-sqlite3` is synchronous, so a query finishes during prerendering and its result would be baked into static output — the proposals list would never change after a build. Pages and parameterless `GET` handlers call `await connection()` before reading data..
- **The data model is small, but the workflow needs care.** The interesting part was making invalid states impossible: one forward-only status rule, a conditional update to avoid races, `PATCH status: "sent"` reusing the send logic so an email is never skipped, and line items limited to the stay dates.
- **Luxury without photography.** Making the member view feel premium with typography alone took several iterations: a serif for headings, but not for numbers; a calm "Confirmed" status instead of a transactional green "Paid"; a muted terracotta accent; and a confirmation dialog with a soft, blurred entrance.
- **Docker dev on macOS.** Hot reload through a bind mount works, but Turbopack sometimes misses files that are replaced atomically. It took a while to tell real bugs from stale builds.

---

## Additional details

### Data model

Tables and columns match the assignment exactly: `members`, `reservations`, `proposals`, `proposal_items`, `sent_emails` (see `prisma/schema.prisma`).

- `price` is an integer number of **USD cents**, which avoids floating-point rounding errors with money.
- `status` and `category` are enums with the values from the assignment.
- IDs are `cuid` strings, so a member link cannot be guessed by incrementing a number.

Status flow: `draft → sent → approved → paid`. Only single forward steps are allowed; any other transition returns `409 Conflict`.

### API

Route handlers match the assignment: `GET /api/reservations`, `GET`/`POST /api/proposals`, `GET`/`PATCH /api/proposals/[id]`, `POST /api/proposals/[id]/send`. The list and single-proposal responses include line items and `total`.

Errors use one format: `{ "error": { "code": "...", "message": "...", "details": [...] } }` with `400`, `404` or `409` status codes (`details` lists validation issues).

- JSON fields use the same snake_case names as the database columns; `price` is in USD cents.
- `PATCH` with `status: "sent"` runs the same logic as `POST /send`, so an email is always recorded.

### Key decisions

- **App Router with a service layer.** Business logic lives in `lib/services/`. Route handlers are thin wrappers around it, and Server Components call the same functions directly instead of fetching their own API over HTTP.
- **One status rule.** `lib/proposal-status.ts` allows only the next step. Updates are conditional on the current status (`updateMany where status = current`), so two concurrent requests cannot apply the same transition twice. Sending runs in one transaction: status, `sent_at` and the `sent_emails` row.
- **Consistent errors.** `withErrorHandling` turns zod errors, `ApiError`s and unexpected failures into the same JSON shape.
- **Shared itinerary component.** The concierge preview, the table's **View** dialog and the member page render the same `Itinerary`, so the concierge sees exactly what the member will see.
- **Two visual languages.** The concierge dashboard is dense and functional (shadcn/ui, Geist). The member view uses Cormorant Garamond headings, warm stone tones, a timeline and generous whitespace; amounts use Geist so numbers line up.
- **No flicker on actions.** Mutations and `router.refresh()` run inside `useTransition`, so buttons stay pending until the refreshed data is on screen.

### Known issues

- An unknown or draft proposal shows the "not available" page, but the HTTP status is `200`, not `404`: with Cache Components the page streams, and `notFound()` runs inside a `<Suspense>` boundary after the headers are sent.
- In Docker on macOS, Turbopack sometimes misses an edit when a file is replaced atomically (for example by an IDE's "safe write", enabled by default in JetBrains IDEs). If a change does not show up, run `docker compose restart`; if styles still look stale, clear the cache: `docker compose exec app sh -c 'rm -rf .next/*' && docker compose restart`. Turning off "safe write" in the IDE avoids it.

---

## Walkthrough

_Loom link: TBD._
