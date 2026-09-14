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

## Known gap

`pnpm db:test` needs the local Supabase stack, which needs Docker or Podman.
Neither is installed on the current workstation, so these assertions are
committed but have not been executed. Phase 1 migrations were applied to the
hosted project instead. Run this suite once a container runtime is available,
before relying on the policies it describes.
