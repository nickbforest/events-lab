# events-lab

A free event publishing tool. A publisher — an artist, venue, club, school or
anyone who runs events — gets a public page at `/publishers/:username` and
publishes events at `/publishers/:username/:slug`, with ticket links to their
own provider.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4 and Supabase
(PostgreSQL, Auth, Storage, RLS).

## Status

The MVP is implemented: accounts, publisher profiles, events with a full
lifecycle, public pages, and dashboard analytics. Production email and
deployment come next; discovery is post-MVP. See
[`context/build-plan.md`](context/build-plan.md) for what is done, what needs
fixing and what comes next.

## Local setup

Use Node.js 22.12 or newer and pnpm 12.3.4. Copy `.env.example` to `.env` and
supply the URL and publishable key of the development Supabase project, plus
`NEXT_PUBLIC_SITE_URL` (it must be on the project's auth redirect allow-list).

```bash
pnpm install
pnpm dev
```

Development currently runs against the hosted Supabase project, which requires
email confirmation, so signing up needs a real inbox. A local Supabase stack
needs Docker Desktop or Podman:

```bash
pnpm supabase:start
pnpm db:types   # regenerates lib/supabase/database.types.ts from the local stack
pnpm db:test    # pgTAP RLS and storage tests
```

## Validation

```bash
pnpm check      # Biome lint + format + import boundaries
pnpm typecheck
pnpm test       # Vitest
pnpm build
```

CI runs the same four on every pull request.

## Documentation

Architecture, the build plan, code standards, UI rules, the UI registry and
progress live in [`context/`](context). Project skills (`/architect`,
`/imprint`, `/recover`, `/remember`) live in `.agents/skills/`.
