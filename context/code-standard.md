# events-lab — Code Standards

## 1. General Principles

Code must be:

* readable
* maintainable
* typed
* testable
* secure
* accessible
* simple

Prefer clarity over cleverness.

Apply SOLID principles pragmatically:

* Single responsibility: UI, transport, BLL, and DAL modules each have one job.
* Open/closed: extend behavior through explicit contracts and composition when
  variation is real.
* Liskov substitution: implementations must preserve their declared contracts.
* Interface segregation: expose small capability-focused interfaces.
* Dependency inversion: business logic depends on DAL contracts, not Supabase
  implementation details.

Do not create abstractions without a real boundary or expected variation. SOLID is
a design constraint, not a reason to add classes or indirection.

---

# 2. TypeScript

TypeScript is mandatory.

Rules:

* Enable strict mode and keep strictness checks enabled.
* Do not use `any`; use `unknown` at untrusted boundaries and narrow it with Zod.
* Prefer inferred domain types over manually duplicated declarations.
* Infer input/output types with `z.infer`, `z.input`, and `z.output`.
* Use generated Supabase database types.
* Validate runtime input with Zod.
* Do not assume TypeScript provides runtime validation.
* Keep types close to their domain when appropriate.
* Add explicit return types at exported boundaries when they improve the contract;
  allow local implementation details to be inferred.
* Do not use unsafe type assertions to bypass validation or nullability.

**Component props are a named, exported interface, never an inline literal.**
Added 2026-09-26 in review.

```tsx
// Do
export interface AvatarProps {
  name: string;
  src?: string | null;
}

export function Avatar({ name, src }: AvatarProps) {}

// Do not — the type cannot be referenced, extended or re-exported, and the
// signature has to be read past to find out what the component takes.
export function Avatar({ name, src }: { name: string; src?: string | null }) {}
```

The interface is declared immediately above the component, after any imports
and before the component's doc comment, and is named `<Component>Props`. A
wrapper that forwards props then has something to extend, and a test has
something to build a fixture against.

---

# 3. React

Prefer server components where appropriate.

Use client components only when client-side behavior requires them.

Do not mark entire pages `"use client"` unnecessarily.

## Conditional rendering

**Never render on a value that is not already a boolean.** Added 2026-09-26 in
review; enforced by `lint/suspicious/noLeakedRender`.

`{value && <Thing />}` renders the value itself when it is falsy but not
`false`. An empty string renders as nothing visible but still produces a text
node, and `0` renders a literal `0` on the page — a bug that reaches
production because the happy path looks correct.

```tsx
// Do — a ternary cannot leak, and TypeScript narrows through it.
{error ? <FormAlert message={error} /> : null}

// Do — an explicit comparison is already boolean.
{items.length > 0 ? <List items={items} /> : null}

// Do — a genuine boolean is fine with &&.
{isReady && <Content />}

// Do not.
{error && <FormAlert message={error} />}
{items.length && <List items={items} />}
```

Prefer the ternary over `Boolean(x) &&`: `Boolean()` does not narrow, so the
branch below it still sees the nullable type.

---

# 4. Next.js

Use:

* Server Components
* Server Actions
* Route Handlers
* `proxy.ts` — Next.js 16 renamed Middleware to **Proxy**; it refreshes the
  session and redirects optimistically, and is never the authorization boundary

Do not create a separate backend service for ordinary MVP functionality.

This is Next.js 16: APIs differ from older versions. Check
`node_modules/next/dist/docs/` before using an API you have not used here, and
use the generated global `PageProps<"/route">` / `LayoutProps<"/route">` types
for pages and layouts.

---

# 5. BLL and DAL

Every data-backed feature must have a Business Logic Layer (BLL) and a Data Access
Layer (DAL), even when each begins as a small module.

Required dependency direction:

```text
UI / server boundary → BLL → DAL → Supabase
```

BLL responsibilities:

* use-case orchestration;
* authorization and domain rules;
* state transitions and invariants;
* transaction and idempotency decisions;
* domain-facing results and errors.

DAL responsibilities:

* Supabase database, Auth, and Storage calls;
* typed persistence and queries;
* database-to-domain mapping;
* provider error translation;
* RPC/transaction calls requested by the BLL.

Forbidden dependency paths:

```text
UI → DAL
UI → Supabase
Server Action / Route Handler → DAL
BLL → Supabase
DAL → BLL
```

Server Components, Server Actions, and Route Handlers must call a BLL use case.
The DAL must not decide business policy, and the BLL must not depend on Supabase
implementation details.

---

# 6. Validation

Use Zod for runtime validation.

Validate:

* forms
* server actions
* API inputs
* query parameters
* route parameters
* headers and cookies when their values affect behavior
* environment variables at startup
* webhooks
* external data
* file metadata and upload constraints

Client validation improves UX.

Server validation is mandatory and must happen before authorization-sensitive
business logic or DAL calls. Never trust values merely because TanStack Form,
TypeScript, or the application's own client produced them.

Use one canonical schema per contract and derive client and server types from it.
Return field-safe validation errors to users without exposing internals.

## No raw external input

**A value that came from outside the process is parsed before it is read.**
Added 2026-09-26 in review. That includes query parameters, even when the code
only compares them to a literal:

```tsx
// Do — the schema owns the fallback, and it is the same on every screen.
const mode = authModeSchema.parse(useSearchParams().get("mode"));

// Do not — a second reader will pick a different default, and a URL that can
// put arbitrary text on the page is where content injection starts.
const mode = searchParams.get("mode") === "login" ? "login" : "signup";
```

Use `.catch(...)` for a value with a sensible default (a display mode, a
notice) and `.safeParse` where the caller must handle the failure (a route
parameter that should 404).

## Links typed by people

Every URL field a person fills in uses `httpUrlSchema` or
`optionalHttpUrlSchema` from `lib/urls.ts`. Plain `z.url()` accepts
`javascript:` and `data:`.

## Compiled schemas

**Schemas on a per-request path are compiled once at module scope.** Added
2026-09-26 in review.

`z.compile` (Zod 4.6) builds the validator ahead of time instead of walking
the schema tree on every call. It returns the same `parse` / `safeParse` and
the same issue shape, so only the cost changes.

```ts
// features/<feature>/contracts.ts
export const compiledProfileUpdateSchema = z.compile(profileUpdateSchema);
```

Compile at module scope, never inside a handler — compiling is the expensive
half, so compiling per call is slower than not compiling at all. Schemas that
run once per process, such as environment parsing, stay uncompiled.

---

# 7. Forms

Use TanStack Form for all stateful application forms and compose it with the
shared field primitives (`Field`, `SelectControl`, `FormSection`,
`ImageUploader`). Pass the shared Zod schema as `validators.onChange` for
client feedback, and infer form values from defaults/schemas rather than
declaring duplicate interfaces. Fields that do not apply are removed from the
payload, not only from the screen.

Forms must have:

* labels
* required indicators where appropriate
* validation messages
* loading state
* disabled state
* success feedback
* error feedback
* keyboard accessibility

Client validation must never be the only validation. The receiving Server Action
or Route Handler must parse the payload again with Zod.

## 7.1 TanStack Query

Use TanStack Query for server state owned by Client Components:

* centralize typed query-key factories by feature;
* call typed transport functions rather than Axios directly from components;
* invalidate or update affected queries after successful mutations;
* render intentional loading, error, empty, and retry states;
* do not copy server state into unrelated local React state.

Do not force TanStack Query into Server Components. Server Components call BLL
queries directly and pass serializable results to client boundaries when needed.

## 7.2 Axios

Axios is the standard HTTP client for application Route Handlers and external HTTP
services. Configure shared instances/interceptors in `lib/http`, validate response
payloads from untrusted services with Zod, and map Axios errors into typed
application errors.

Do not use Axios for direct Supabase access. Use the typed Supabase client inside
the DAL.

---

# 8. Supabase

Use Supabase consistently with the application architecture.

Rules:

* Use appropriate server/client Supabase clients.
* Never expose service-role credentials.
* Use migrations.
* Use generated database types.
* Preserve RLS.
* Do not bypass RLS as a shortcut.
* Keep browser, server, and privileged clients separate.
* Keep all feature-level Supabase calls inside the DAL.
* Derive actor identity from the authenticated server context, not submitted IDs.

---

# 9. Database

All schema changes must use migrations.

Prefer:

* foreign keys
* indexes
* constraints
* normalized tables
* explicit join tables
* timestamps

Do not manually alter production schema outside the migration process.

---

# 10. Naming

React components:

```text
PascalCase
```

Variables/functions:

```text
camelCase
```

Database fields:

```text
snake_case
```

URLs/slugs:

```text
kebab-case
```

Use descriptive names.

Avoid:

```text
data
thing
stuff
temp
foo
bar
```

---

# 11. Components

Components should have one clear responsibility.

Prefer:

```text
EventCard
EventDate
EventLocation
EventOrganizer
```

instead of one enormous event component.

Reusable UI primitives belong in the shared UI system.

Domain-specific UI belongs in the domain feature.

Use shadcn/ui primitives before creating a new base primitive. None has been
generated yet: the hand-written components in `components/ui` and
`components/forms` are the current base set, listed in `ui-registry.md`. Use
TanStack Table for application data tables (the events list is still a plain
`<table>` — `build-plan.md` M11) and TanStack Charts for charts; wrap both in
shared, accessible components that follow `context/ui-registry.md`.

A component used by one route lives beside it in `app/`; move it to
`components/` when a second route needs it.

TanStack Table and Charts are logic/rendering engines, not replacements for the
project's visual system. Use semantic markup, keyboard support, labels, readable
fallbacks, and the project's Tailwind tokens.

---

# 11.1 Routing

Added 2026-09-26 in review.

**No route is written as a string literal outside `lib/routes.ts`.** A path
typed at a call site cannot be renamed safely, cannot be found reliably, and a
typo in one is a broken link nobody notices until someone clicks it.

```tsx
// Do
<Link href={routes.publisher(profile.username)}>
redirect(routes.dashboard.root());

// Do not
<Link href={`/u/${profile.username}`}>
redirect("/dashboard");
```

Two shapes live in that module and they are not interchangeable:

* `routes.*` build a concrete href, for links and redirects.
* `routePatterns.*` are Next.js segment patterns (`/publishers/[username]`),
  for `revalidatePath(pattern, "page")`. Passing a concrete href where a
  pattern is expected silently revalidates nothing — Next.js does not report
  it.

**Route segments are words, not initials.** `/publishers/:username`, not
`/u/:username`. The segment is read by people, shared in messages and read
aloud; a single letter says nothing about what is on the other side of it.
`/u` was renamed in this review.

**A new top-level route reserves its own name.** `RESERVED_ROUTE_SEGMENTS` in
`lib/routes.ts` feeds the reserved-username list. Usernames live under
`/publishers/`, so they cannot shadow a page today, but a username that reads
like an application path (`/publishers/dashboard`) still misleads, and a later
move to root-level handles would make it a real collision.

---

# 12. Dependency Rules

Before installing a package:

1. Check whether the existing stack already solves the problem.
2. Check whether a small local implementation is sufficient.
3. Consider bundle size.
4. Consider maintenance.
5. Consider whether the dependency creates architectural coupling.

Do not add libraries simply because they are popular.

---

# 13. ORM

Do not install Prisma or Drizzle unless explicitly approved.

Supabase/PostgreSQL tooling is the default.

---

# 14. Error Handling

Errors must be:

* intentional
* understandable
* actionable where possible
* logged appropriately

## One place for codes, wording and logging

Restructured 2026-09-26 in review.

* **Codes** are the `ApplicationErrorCode` union in `lib/errors.ts`. A feature
  does not invent its own string.
* **Wording** shown to a person comes from `USER_FACING_MESSAGES`, via
  `toUserMessage(error)`. A message written at the throw site is invisible to
  translation and drifts from what a sibling path says about the same failure.
  The one exception is `VALIDATION_FAILED`, whose message is written for a
  specific field.
* **Logging** goes through `createLogger(scope)` in `lib/logging.ts`. Never
  call `console.*` directly; `lint/suspicious/noConsole` enforces it, and the
  logger module is the single opt-out.
* **Boundaries translate, layers throw.** The BLL and DAL throw
  `ApplicationError`; every Server Action wraps its service calls in
  `try/catch` and returns `actionFailure(log, "actionName", error, context)`
  (`lib/action-errors.ts`), which logs — `warn` for refused rules, `error`
  for faults — and returns the user-facing `FormResult`. A value that is not
  an `ApplicationError` is a bug: `actionFailure` logs it and rethrows so the
  error boundary still sees it. Keep `redirect()` outside the `try`.
* **Clients show every result.** A component calling an action renders its
  error message and catches a thrown call (network, crash) with
  `USER_FACING_MESSAGES.UNEXPECTED` plus a log line.

Never silently swallow errors. Where a failure genuinely must not surface —
cleanup after a write that already succeeded — the `catch` logs and says in a
comment why surfacing it would be worse. An empty `catch {}` is never correct.

Never expose:

* stack traces
* secrets
* database internals
* sensitive implementation details

to normal users.

---

# 15. Security

Never:

* trust client-side authorization
* disable RLS
* expose secrets
* expose service-role credentials
* accept unvalidated input
* log passwords/tokens
* bypass permission checks

Security must be designed into features from the beginning.

---

# 16. Accessibility

Every interactive UI should support:

* keyboard navigation
* focus states
* semantic HTML
* accessible labels
* meaningful errors
* screen readers

Do not rely solely on color to communicate state.

---

# 17. Loading States

Every async UI flow should have an intentional loading state.

Use:

* skeletons
* spinners
* disabled actions
* progress indicators

where appropriate.

Never leave users wondering whether an action happened.

---

# 18. Empty States

Empty states should explain:

1. What is empty
2. Why it may be empty
3. What the user can do next

---

# 19. Testing

Critical domain logic must be tested.

Critical user flows require E2E tests.

Security-sensitive code must have explicit tests.

Test layer boundaries:

* BLL unit tests cover business rules without Supabase.
* DAL integration tests cover queries, mappings, migrations, and provider errors.
* RLS tests prove tenant and ownership isolation.
* contract tests prove Zod accepts valid input and rejects invalid input.
* UI tests cover TanStack Form, Query, Table, and Charts behavior that users rely on.

A feature is not complete because the UI appears to work.

## Where tests live

* Vitest, node environment: colocated `*.test.ts` under `features/` and
  `lib/` (`vitest.config.mts` includes only those). BLL tests use a fake
  repository, never Supabase.
* pgTAP: `supabase/tests/database/*.test.sql`, one file per protected table or
  bucket, run with `pnpm db:test` against the local stack.
* There are no UI or E2E tests yet. Playwright is the chosen E2E tool.

## Fixtures, not literals

Added 2026-09-26 in review. Identifiers, usernames, paths and URLs that more
than one assertion needs live in a colocated `test-fixtures.ts`, not retyped
per assertion — a literal repeated across a file is the same hazard in a test
as in production code, because a change updates some copies and leaves the
rest asserting the old world.

Host names come from that fixture module's `TEST_ENV`, which reads an
environment variable with a `.invalid` fallback, so no test hard-codes a real
domain and none can reach one.

---

# 20. Git

Use focused commits.

Preferred format:

```text
feat(events): add event creation
feat(auth): add Google authentication
fix(events): validate event timezone
refactor(ui): extract event card
test(events): add publish lifecycle tests
```

Avoid huge unrelated commits.

---

# 20.1 Linting and formatting

Biome is the repository's single linting and formatting tool (ESLint was
removed in Phase 0). Its configuration lives in `biome.json` at the root and
also enforces the layer import boundaries; CI runs `pnpm check`. Do not add a
second linter or formatter.

---

# 21. Definition of Done

A feature is complete when:

* functionality works, and has been checked in the browser
* every action result — success or failure — is visible to the user
* types pass
* lint passes
* validation exists
* all user-controlled inputs are validated again on the server
* authorization exists
* business logic is in the BLL
* data access is in the DAL
* strict TypeScript passes without `any` or unsafe boundary assertions
* relevant tests exist
* loading states exist
* error states exist
* empty states exist
* responsive behavior works
* accessibility has been considered
* documentation is updated when necessary
* `progress-tracker.md` and `build-plan.md` are updated

---

# 22. Agent rules

Applies to every coding agent working in this repository.

Before implementing a significant feature:

1. Read relevant context files.
2. Inspect the existing code.
3. Identify existing reusable components/patterns.
4. Implement the smallest coherent change.
5. Run relevant checks (`pnpm check`, `pnpm typecheck`, `pnpm test`,
   `pnpm build`; the same binaries are in `node_modules/.bin` if pnpm is not
   on the PATH).
6. Update `progress-tracker.md` and `build-plan.md`.

Agents must not:

* rewrite unrelated code
* introduce architecture changes casually
* replace established libraries
* create duplicate components
* bypass security
* add unnecessary dependencies
* bypass the BLL/DAL dependency direction
* replace the mandated Zod, TanStack, Axios, shadcn/ui, or Supabase stack without
  explicit architectural approval

Architectural changes require explicit approval.
