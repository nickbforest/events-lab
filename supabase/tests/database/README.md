# Database and RLS tests

Place pgTAP tests here with the same migration that introduces a protected table.
Every protected table must prove public visibility, authenticated ownership,
cross-user denial, and write constraints before its feature is marked complete.

Run the suite against the local Supabase stack with:

```bash
pnpm db:test
```

Phase 0 has no domain tables, so there are no table-specific RLS assertions yet.
