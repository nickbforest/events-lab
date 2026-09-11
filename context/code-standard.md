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

---

# 3. React

Prefer server components where appropriate.

Use client components only when client-side behavior requires them.

Do not mark entire pages `"use client"` unnecessarily.

---

# 4. Next.js

Use:

* Server Components
* Server Actions
* Route Handlers
* Middleware/proxy where appropriate

Do not create a separate backend service for ordinary MVP functionality.

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

---

# 7. Forms

Use TanStack Form for all stateful application forms and compose it with shadcn/ui
field primitives. Use shared Zod schemas for form validation and infer form values
from defaults/schemas rather than declaring duplicate interfaces.

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

Use shadcn/ui primitives before creating a new base primitive. Use TanStack Table
for application data tables and TanStack Charts for charts; wrap both in shared,
accessible components that follow `context/ui-registry.md`.

TanStack Table and Charts are logic/rendering engines, not replacements for the
project's visual system. Use semantic markup, keyboard support, labels, readable
fallbacks, and shadcn/Tailwind styling.

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

Never silently swallow errors.

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

# 21. Definition of Done

A feature is complete when:

* functionality works
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
* progress tracker is updated

---

# 22. Codex Rules

Before implementing a significant feature:

1. Read relevant context files.
2. Inspect the existing code.
3. Identify existing reusable components/patterns.
4. Implement the smallest coherent change.
5. Run relevant checks.
6. Update `progress-tracker.md`.

Codex must not:

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
