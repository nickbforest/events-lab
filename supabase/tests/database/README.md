# Database and RLS tests

Place pgTAP tests here with the same migration that introduces a protected table.
Every protected table must prove public visibility, authenticated ownership,
cross-user denial, and write constraints before its feature is marked complete.

Run the suite against the local Supabase stack with:

```bash
pnpm db:test
```

## Current coverage

| File | Covers |
| --- | --- |
| `profiles_rls.test.sql` | Phase 1 `profiles`: trigger-created rows, username uniqueness and format, public read, self-only update. |
| `profile_media_storage.test.sql` | Phase 2 `profile-media`: bucket limits, owner-folder writes, no enumeration, owner-only delete. |
| `events_rls.test.sql` | Phase 4 `events`, `categories`, `tags`, `event_tags`: structural constraints, per-owner slug uniqueness, draft privacy, cancelled events staying public, cross-user denial, sealed category list. |
| `event_media_storage.test.sql` | Phase 4 `event-media`: bucket limits, owner-folder writes, no enumeration, owner-only delete. |

## Known gap

`pnpm db:test` needs the local Supabase stack, which needs Docker or Podman.
Neither is installed on the current workstation, so these assertions are
committed but have not been executed as a pgTAP suite. Migrations are applied
to the hosted project instead.

Each assertion has been verified against the hosted project by running its
equivalent inside a transaction that was rolled back, leaving no rows behind.
Phase 4 verified 12 structural checks, 6 constraint probes, 12 RLS probes and
6 storage probes this way; all held. That is a weaker guarantee than running
the suite — it proves the assertions pass today, not that they keep passing —
so run `pnpm db:test` once a container runtime is available.
