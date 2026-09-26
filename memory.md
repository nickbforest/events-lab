# Memory — Phase 4 Events, and the PR #6 review pass

Last updated: 2026-09-26

## What was built

Two strands, on two branches.

**Phase 4 — Events**, committed on `feat/phase-4-events` (branched from
`feat/phase-2-profiles`, so it stacks on PR #6). Real events end to end:
migrations for `categories`, `tags`, `events`, `event_tags` and the
`event-media` bucket, all applied to the hosted Supabase project; contracts,
BLL, Supabase DAL, a shared create/edit form, a lifecycle panel, and
`lib/datetime.ts`. Full record in `context/progress-tracker.md` Phase 4.

**PR #6 review pass**, on `feat/phase-2-profiles`. Nine inline comments from
`geo318` plus a standing instruction to fix each pattern repo-wide. New
`lib/routes.ts`, `lib/logging.ts`, a rewritten `lib/errors.ts`, hardened
Biome rules, and every invariant written into `context/code-standard.md`.

## Decisions made

- `/u/:username` is now `/publishers/:username`. Chosen in review; the old
  URL is gone, and no route may be a string literal outside `lib/routes.ts`.
- No `completed` event status. Completion derives from `end_at`.
- Organizations stay deferred; MVP-1 publishes through profiles.
- Publish-readiness is a BLL rule, not a CHECK and not a stricter schema.
- `z.compile` for per-request schemas, compiled at module scope only.
- Errors: codes and user-facing wording live in `lib/errors.ts`; all logging
  goes through `lib/logging.ts`; `console.*` is banned by lint.
- Component props are named exported `<Name>Props` interfaces.
- JSX conditionals use `cond ? <X/> : null`, not `&&`.

## Problems solved

- Biome's `--unsafe` autofix silently deleted two `console.error` calls and
  left empty `catch {}` blocks. Both restored through the logger. Check for
  this after any `--unsafe` run.
- Zod's stricter publish schema re-parsed already-parsed output, so `""`→null
  transforms rejected their own results. Publish rules moved to the BLL.
- `publishIntent` as React state was read stale inside the submit closure, so
  the first Publish click saved a draft. It is a ref now.
- Biome writes diagnostics to stderr and truncates them; scripts need
  `--colors=off --max-diagnostics=200` and must read stderr.
- pgTAP still needs Docker. Assertions are verified against the hosted
  project inside transactions that roll back.

## Current state

- Phase 4: committed, all automated checks green.
  **Never opened in a browser.** Create, publish, edit, cover upload, cancel,
  delete and the public page are unverified by a human.
- PR #6 review pass: all nine comments addressed, 68 files changed,
  uncommitted at the time of writing.

## Next session starts with

1. Browser-test Phase 4 end to end. This is the oldest unpaid debt.
2. Rebase `feat/phase-4-events` onto the merged `main` and bring it up to the
   new standards — it predates all of them: hardcoded routes, inline prop
   types, `&&` in JSX, uncompiled schemas, no logger.

## Open questions

- Phase 4 needs a real standards pass, not just a rebase (~1,800 lines).
- Recurrence still deferred.
- Discovery and analytics remain mock-backed and now contradict real events.
- Custom SMTP still needed before launch; email change still untested.
