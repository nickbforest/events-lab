# events-lab — UI Rules

## 1. Product Personality

events-lab should feel:

* modern
* clean
* trustworthy
* professional
* simple
* fast
* approachable

The interface should prioritize content and usability over decoration.

---

# 2. Visual Philosophy

Use a modern SaaS visual language.

Prioritize:

1. Clear hierarchy
2. Excellent typography
3. Consistent spacing
4. Strong usability
5. Clear actions
6. Responsive behavior
7. Accessibility

Avoid excessive:

* gradients
* glassmorphism
* shadows
* animations
* decorative elements
* borders
* visual noise

---

# 3. Layout

Use a consistent responsive container system.

Desktop should provide generous whitespace without wasting excessive horizontal space.

Mobile must be intentionally designed.

Do not simply shrink desktop layouts.

---

# 4. Typography

Use typography to establish hierarchy:

```text
Page title
Section title
Card title
Body
Metadata
Supporting text
```

Event titles should be prominent.

Date, time, location, and organizer should be easy to scan.

---

# 5. Event Cards

Event cards prioritize:

1. Image
2. Date
3. Title
4. Location
5. Organizer/category
6. Price/status where relevant

Cards should have a clear primary clickable area.

Avoid excessive controls inside cards.

---

# 6. Public Event Page

The event page should prioritize:

```text
Hero
Title
Date/time
Location
Primary action
Organizer
Description
Gallery
Map
Related events
```

The most important information should appear before long descriptions.

---

# 7. Event Creation

Event creation should feel simple even though the underlying data model is powerful.

Recommended sections:

```text
1. Basic information
2. Date & time
3. Location
4. Media
5. Tickets / external links
6. Categories / tags
7. Publishing
```

Do not overwhelm the user with every optional field at once.

---

# 8. Forms

Forms must:

* have clear labels
* indicate required fields
* provide inline validation
* preserve user input after recoverable errors
* display saving state
* display publishing state
* provide useful error messages
* support keyboard navigation

---

# 9. Loading States

Every data-driven screen must have an intentional loading state.

Prefer skeletons for content-heavy screens.

Avoid blank screens.

---

# 10. Empty States

An empty state must explain:

* what is empty
* why it is empty
* what the user can do next

Example:

```text
No upcoming events yet.

Create your first event to start promoting it.

[ Create Event ]
```

---

# 11. Error States

Errors must be:

* understandable
* concise
* actionable when possible

Never show technical implementation details to normal users.

---

# 12. Responsive Design

Support:

* mobile
* tablet
* desktop

Event discovery is particularly important on mobile.

Maps and filter interfaces must adapt to small screens.

---

# 13. Accessibility

All UI must consider:

* keyboard navigation
* visible focus
* semantic HTML
* screen readers
* labels
* accessible forms
* appropriate ARIA
* contrast
* reduced motion

Never communicate status only through color.

---

# 14. Animation

Use animation sparingly.

Animation should communicate:

* transitions
* feedback
* loading
* state changes

Avoid decorative animation.

Respect reduced-motion preferences.

---

# 15. Buttons

Primary actions must be visually obvious.

Examples:

```text
Create Event
Publish Event
Save Changes
Get Tickets
Search Events
```

Destructive actions require appropriate confirmation.

---

# 16. Status

Statuses should use both text and visual indication.

Examples:

```text
Draft
Published
Cancelled
Postponed
Completed
Archived
```

Do not rely only on color.

---

# 17. Maps

Maps should support discovery rather than dominate the experience.

Desktop:

```text
Filters | Event list | Map
```

Mobile:

```text
Event list
     ↕
Map view
```

Use an explicit map/list switch when appropriate.

---

# 18. Images

Images are important to events-lab.

Images should:

* use consistent aspect ratios
* crop appropriately
* have meaningful alt text
* lazy-load when appropriate
* avoid layout shift
* use optimized delivery

---

# 19. SEO/Public Experience

Public event and organization pages are first-class web pages.

They must be:

* fast
* shareable
* indexable where appropriate
* mobile-friendly
* readable without authentication

---

# 20. Consistency Rule

Once a UI pattern is established, reuse it.

Do not allow individual pages to invent different:

* button styles
* spacing
* card structures
* forms
* badges
* loading states
* empty states
* navigation patterns

When a genuinely new reusable pattern is required:

1. Add it to `ui-registry.md`
2. Document the rule here
3. Implement it consistently

---

# 21. Forms, Tables, and Charts

Use shadcn/ui primitives as the visual foundation for application interfaces.

Use TanStack Form for stateful forms. Field components must surface Zod validation
messages accessibly, preserve recoverable input, and expose pending/submission
state without relying on color alone.

Use TanStack Table as the headless engine for application data tables and render it
with semantic, accessible shadcn/ui-compatible markup. Tables must support their
intended keyboard behavior, responsive overflow, loading/error/empty states, and
server-side pagination/filtering/sorting for non-trivial datasets.

Use TanStack Charts through shared chart components. Every chart must have an
accessible name and a readable text, summary, or table fallback when the visual is
required to understand the data. Charts must follow the registered typography,
spacing, color, tooltip, and reduced-motion patterns.

Do not let TanStack headless defaults create a competing visual system. Register
new reusable form, table, and chart patterns in `context/ui-registry.md` after they
are implemented.
