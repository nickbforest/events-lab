# events-lab

An event publishing and discovery application built with Next.js 16, React 19,
TypeScript, Tailwind CSS, and Supabase.

## Local setup

Use Node.js 22.12 or newer and pnpm 12.3.4. Copy `.env.example` to `.env` and
supply the public URL and publishable key for the development Supabase project.

```bash
pnpm install
pnpm dev
```

The Supabase CLI is installed as a project dependency. Local Supabase requires
Docker Desktop or Podman:

```bash
pnpm supabase:start
pnpm db:types
```

## Validation

```bash
pnpm check
pnpm typecheck
pnpm test
pnpm build
```

Architecture, implementation order, UI rules, and current progress live in the
[`context`](context) directory.
