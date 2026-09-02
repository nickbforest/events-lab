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

Do not introduce abstractions without a real reason.

---

# 2. TypeScript

TypeScript is mandatory.

Rules:

* Avoid `any`.
* Prefer explicit domain types.
* Use generated Supabase database types.
* Validate runtime input with Zod.
* Do not assume TypeScript provides runtime validation.
* Keep types close to their domain when appropriate.

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

# 5. Business Logic

Business logic must not live inside UI components.

Bad:

```text
Page
 ├── JSX
 ├── database query
 ├── permission logic
 ├── validation
 └── business rules
```

Prefer:

```text
Feature
 ├── components
 ├── actions
 ├── queries
 ├── schemas
 ├── types
 └── utils
```

---

# 6. Validation

Use Zod for runtime validation.

Validate:

* forms
* server actions
* API inputs
* query parameters
* external data

Client validation improves UX.

Server validation is mandatory.

---

# 7. Forms

Use React Hook Form for complex forms.

Forms must have:

* labels
* required indicators where appropriate
* validation messages
* loading state
* disabled state
* success feedback
* error feedback
* keyboard accessibility

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
* authorization exists
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

Architectural changes require explicit approval.
