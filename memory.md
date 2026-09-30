# Memory — MVP baseline audit and hardening pass

Last updated: 2026-09-30

## What was built

Branch `feat/mvp-hardening` (off `main` at `fd61992`). **Nothing is committed
yet**: the docs rewrite from the 2026-09-26 audit and all of the code below
are in the working tree.

- **Docs:** every `context/` file rebuilt against the code. `build-plan.md` is
  now organised by status (§A implemented, §B fix list with stable IDs
  C1–C2 / I1–I10 / M1–M13, §C partial, §D remaining, §E post-MVP).
- **Event lifecycle (I1):** `EVENT_TRANSITIONS` in
  `features/events/contracts.ts` is the one table. The events service
  enforces it, and `EventLifecycle` renders its buttons from it. Readiness is
  checked on every move into a public status. The slug is locked once
  `published_at` is set.
- **No silent failures (I2):**
  - `lib/action-errors.ts` `actionFailure()` is used by every Server Action:
    events, profiles and auth.
  - Row toggle, delete and lifecycle show errors inline.
  - `toPayload` clears inapplicable fields, and field errors for fields that
    aren't on screen become form-level messages (`renderedFields`).
- **Event page (I3):** location shows whenever it exists, the country by
  name, and JSON-LD `Place` / `VirtualLocation` / both.
- **Password reset (I4):**
  - `/auth/confirm` sets an httpOnly `el-recovery` cookie
    (`features/auth/recovery-marker.ts`, 15 min, path `/auth`).
  - The update-password page redirects other sessions to Settings.
  - `authService.updatePassword(actor, input, marker)` refuses a mismatched
    marker.
- **Links (I6):** `lib/urls.ts` `httpUrlSchema`, http(s) only. The cover URL
  must be in the owner's `event-media` folder
  (`EventsRepository.isOwnedCoverUrl`).
- **Analytics (I7), built from a confirmed blueprint:**
  - Migration `20260930115636_create_analytics.sql`, **applied**:
    `analytics_hits`, a definer function `record_analytics_hit`, and invoker
    functions `analytics_daily` and `analytics_top_events`.
  - Write path: `POST /api/analytics` → analytics BLL (skips the owner) →
    Supabase DAL.
  - Browser side: `components/analytics/{track-view,ticket-link}.tsx` via
    `features/analytics/transport.ts`, deduped per session; previews are not
    tracked.
  - The overview uses real data. `lib/mock-data.ts` and the in-memory
    adapter are deleted.
- **Screens (I8):** `app/not-found.tsx`, `error.tsx`, `global-error.tsx`;
  dashboard `error` / `not-found` / `loading`. New primitives:
  `components/ui/status-message.tsx` and `skeleton.tsx`.
- **Migrations (I9):** local files renamed to the hosted versions.
- **Discovery removed:** `/discover`, `features/discovery`, `DiscoverFilters`
  and the landing and empty-state links. The `discover` username stays
  reserved.
- **Tests:** 152 Vitest tests (123 before). New pgTAP files:
  `analytics_rls`, `profiles_hardening`. There's also a reserved-username
  drift test.

## Decisions made

- Discovery and the signup publisher-type select are dropped from the MVP.
- Email, domain and deployment work (C2) goes in its own PR.
- Analytics counts a visit once per browser session per page, in the
  browser, never the owner's own visits, never `?preview=1`. Ticket clicks
  are a beacon on the plain anchor. No IP, user agent or visitor id is
  stored.
- Public pages get no `loading.tsx`: streaming turned 404s into 200s.
- `postponed → archived` is allowed. The list toggle only acts on
  draft / published / archived rows.

## Problems solved

- A column-level REVOKE doesn't override Supabase's table-level UPDATE grant.
  The fix is to revoke the table grant and grant a column list.
- The Next 16 error boundary prop is `retry()`, not `reset`. `global-error`
  must import `globals.css` itself.
- `z.url()` accepts `javascript:`, `data:` and `ftp:`.
- Axios `apiClient` has baseURL `/api`, so `routes.api.*` are now relative to
  it.
- `pnpm` isn't on PATH on this machine: use `node_modules/.bin/*`.
  Playwright ran from a scratch install using the cached
  `chromium_headless_shell-1243`.

## Current state

- Biome, tsc, Vitest (152) and `next build` are all clean.
- The signed-out Playwright smoke pass is 27/27. Analytics calls were
  intercepted, so no test rows were written to the hosted DB.
- All 8 migrations are applied and match the local files. The username lock
  and reserved-name trigger (`20260930124644_harden_profiles.sql`) were
  applied and verified on hosted on 2026-09-30.
- Supabase advisor warns that `record_analytics_hit` is callable by anon /
  authenticated. That's intended.

## Next session starts with

1. Commit in focused commits (docs, events/lifecycle, auth, analytics,
   screens, discovery removal) and open the PR.
2. The developer runs the signed-in checklist in `build-plan.md` §D.
3. Then the C2 PR: SMTP, auth settings, domain, deploy.

## Open questions

- Sidebar sign-out ends all sessions (`global`). Keep it, or switch to
  `local`?
- Is there a test account (with email confirmation) for adding Playwright to
  CI?
- Unused dependencies `@tanstack/react-table` and `date-fns` need removing
  with pnpm (M11).
