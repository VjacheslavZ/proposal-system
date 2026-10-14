@AGENTS.md

# Concierge Itinerary Proposal System

Take-home assessment: concierges build itinerary proposals, members approve and "pay". See `README.md` for the product and `docs/PLAN.md` for the plan. Only what the assignment requires is in scope.

## Commands

- Run: `docker compose up -d` (dev mode, hot reload; migrations + seed run on start). Without Docker: `npm run setup && npm run dev`.
- Check: `npx next typegen && npx tsc --noEmit`, `npm run lint`, `npx next build`.
- Reset the database: `docker compose down && rm -rf data`.

## Conventions

- Business logic lives in `lib/services/`; route handlers (`app/api/`) are thin and wrapped in `withErrorHandling`. Server Components call services directly, not the API.
- Prisma fields and API JSON use snake_case, matching the assignment's column names. `price` is an integer in USD cents.
- Status changes go through `lib/proposal-status.ts` (forward one step only); sending always goes through `sendProposal`.
- Client mutations use `apiRequest` + `router.refresh()` inside `useTransition`.
- Dates are stored and formatted in UTC; time zones are intentionally ignored (`lib/format.ts`).
- `components/proposal/` is shared by the concierge preview and the member view.

## Gotchas

- Cache Components are on and `better-sqlite3` is synchronous: call `await connection()` before reading data in pages and parameterless `GET` handlers, or the result is prerendered.
- Params access needs a `<Suspense>` boundary (see `app/proposal/[id]/page.tsx`).
- In Docker on macOS, Turbopack can miss edits to files replaced atomically; edit files in place, or `docker compose restart` if a change does not show up.
