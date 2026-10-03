# events-lab — UI Rules

The rules the interface follows. Section numbers are stable: code comments cite
them (for example "ui-rules.md §13"). Concrete classes live in
`ui-registry.md`; tokens live in `app/globals.css`.

Last reconciled with the code: 2026-09-30.

---

# 1. Product personality

Confident, editorial, fast, trustworthy, simple. Content and the next action
come first; decoration never competes with them.

---

# 2. Visual system

events-lab uses a **dark editorial system with a single lime accent**,
chosen by the developer (adapted from the happenings-heap reference; visual
reference only, never its architecture). It replaces the earlier "neutral
SaaS" direction.

* **Ground:** near-black `--background` (`hsl(240 10% 3.9%)`); surfaces are
  `bg-card` or translucent `bg-card/30`–`/40`; hairline `border-border`.
* **Accent:** lime `--primary` (`hsl(75 95% 65%)`) with dark
  `--primary-foreground`. One primary (lime) action per view or card.
  Kickers, focus rings, active states and the wordmark dot use it; body
  text never does.
* **Semantic colours:** `--destructive`, `--warning` (postponed),
  `--success`. Always paired with text (§16).
* **Radius:** `rounded-md` for controls, `rounded-lg` for cards and panels,
  `rounded-full` for chips and switches. Avatars are `rounded-lg`, never
  circles.
* **Depth:** no shadows. Separation comes from borders, surface tone and the
  dialog backdrop.
* **Motion:** `--ease-studio`; the landing hero reveal and marquee, and the
  upload bar, are the only animations (§14).
* Dark only: there is no light theme.

Avoid gradients (except the landing marquee edge fades), glassmorphism
(except the sticky header's `backdrop-blur-md` and the dialog backdrop), and
extra borders or ornaments.

---

# 3. Layout

* Public pages: `max-w-7xl` header/footer, `max-w-5xl` lists, `max-w-4xl`
  event article; `px-6` gutters.
* Dashboard: fixed `w-64` sidebar from `md`; content `px-6 py-10 md:px-10`
  inside `max-w-5xl` (lists) or `max-w-2xl`–`max-w-3xl` (forms).
* Auth: a centred `max-w-sm` `AuthCard`.
* Mobile is designed, not shrunk: the event card's date rail becomes a
  horizontal strip, grids collapse to one column. The dashboard sidebar still
  stacks above content on phones (`build-plan.md` M13).

---

# 4. Typography

| Role | Treatment |
| --- | --- |
| Display (page and card titles, stats, wordmark) | Inter Tight (`font-display`), `font-extrabold`, **uppercase**, `tracking-tight`/`tracking-tighter` |
| Body | Inter (`font-sans`), `text-sm`–`text-lg`, `text-muted-foreground` for supporting copy |
| Metadata, labels, kickers, hints | JetBrains Mono (`font-mono`), `text-xs`, usually `uppercase tracking-widest` |

Hierarchy: kicker (mono, lime) → title (display) → context line (mono, muted).
Event titles are the most prominent text on any event surface. Date, time,
location and organizer must scan at a glance. Numbers that change use
`tabular-nums`.

---

# 5. Event cards

Priority: date → image → title → summary → location → description → the way
in (ticket button). Category is the kicker above the date.

One primary target: the title link stretches over the card. Inner controls
(map, ticket) sit above it on `relative z-10`. Never wrap a card containing
links in an anchor. Descriptions are clamped. No ticket button on a cancelled
event.

---

# 6. Public event page

Order: hero image → cancelled banner (if cancelled) → category and status →
title → summary → description → tags → organizer; a sidebar with date, time
(with zone), location, price, then the primary action (ticket or join). Related
events follow.

The most important facts appear before long descriptions. Map and gallery are
post-MVP.

---

# 7. Event creation

Creating an event is a dialog over the events list with the essential
sections: Basic information, Date & time, Location, Media, Tickets. The full
editor adds time zone, price, links, tags and the lifecycle panel.

Inapplicable fields are **absent, not disabled** (online events have no venue
block; free events have no price field). Don't show every optional field at
once.

---

# 8. Forms

* A visible `<label>` for every control; hints state constraints up front.
* Inline validation; a field shows at most one message (the error replaces the
  hint) and is wired with `aria-describedby` and `aria-invalid`.
* Form-level failures render as a `role="alert"` line above the submit.
* Preserve input after recoverable errors.
* Submit buttons disable while pending and switch to a present participle
  ("Saving…", "Publishing…").
* Success is a polite `aria-live` line, and says when a result is not final
  ("Confirmation pending for …").
* A value that can be seen but not changed is a real read-only input with a
  hint that says why.

---

# 9. Loading states

Every data-driven screen needs an intentional loading state; prefer skeletons
for content screens and never leave a blank screen. Dashboard routes use
`app/dashboard/loading.tsx` (`Skeleton` blocks shaped like the real layout
inside a `LoadingRegion`). Public pages have none on purpose: they render
fast on the server, and streaming would turn a missing page's 404 into a 200.

An upload shows it is in flight with a spinner, a busy label and an
indeterminate progress bar over a dimmed preview (`ImageUploader`). Never
show a percentage the app cannot measure — Server Actions report no byte
progress.

---

# 10. Empty states

Say what is empty, why, and what to do next, with one action:

```text
No events yet.
You have not created any events. Your first one takes about a minute…
[ Create your first event ]
```

Full-page empties use `EmptyState` (dashed border). Inside a `Panel`, use the
one-line `PanelEmpty`.

---

# 11. Error states

Errors are understandable, concise and actionable, and never show technical
detail. Wording comes from `USER_FACING_MESSAGES` (`lib/errors.ts`). Every
action result must be shown, next to the control that caused it; a failure
that produces no visible message is a bug. A field error for a field that is
not on screen becomes the form-level message.

Whole-screen states use `StatusMessage`: `app/not-found.tsx` and
`app/error.tsx` on public pages, the dashboard's own `error` and `not-found`
inside the shell, `app/global-error.tsx` as the last resort. Each says what
happened, what to do, and offers a way out ("Try again", home, Overview).
A not-found never reveals whether a hidden page exists.

---

# 12. Responsive design

Support phone, tablet and desktop. Public pages and the event card are the
highest priority on mobile. Filters wrap; tables hide secondary columns below
`sm`.

---

# 13. Accessibility

* Keyboard reachable everything; visible `:focus-visible` ring (lime, 2px).
* Semantic elements first: `<dialog>` for modals, `<button role="switch">` for
  toggles, `<search>`, `<fieldset>`/`<legend>` for chip groups, `<time>` for
  dates, a `<label>` wrapping file inputs.
* Icon-only controls carry an `sr-only` name that includes the item ("Delete
  Jazz Night").
* Links that open a new tab say so to screen readers.
* Toggle chips use `aria-pressed` plus a visible checkmark.
* Charts have an accessible name and a "View as table" fallback.
* Respect `prefers-reduced-motion` (handled globally in `globals.css`).
* Never communicate state by colour alone.

---

# 14. Animation

Motion communicates feedback, loading and state changes only. Current motion:
the landing hero reveal and audience marquee, the upload bar, and colour
transitions on hover. Everything stops under reduced motion. No decorative
animation elsewhere.

---

# 15. Buttons and actions

* **Primary:** lime fill, one per view or card ("Publish", "Save changes",
  "Get tickets").
* **Secondary:** outlined `border border-border`, `hover:bg-white/5`.
* **Destructive:** outlined `border-destructive/40`, never filled.
* Destructive actions confirm **in place** (the control becomes "Delete? Yes /
  No" or "Delete permanently / Keep it"). No `confirm()`, no modal for a
  small decision.
* Actions that change what a ticket holder sees (cancel, postpone) live on the
  full editor, not inline in a list.
* Every preview of a public page opens in a new tab with `?preview=1`
  (the editor's "View public page" is the current exception — M8).

---

# 16. Status

Statuses always show text as well as colour: **Draft, Published, Postponed,
Cancelled, Archived** (`EVENT_STATUS_META` in `lib/format.ts`). There is no
"Completed" status; finished events are shown under "Past".

---

# 17. Maps

Post-MVP. Until then the event card and event page show a plain "View on
map" link: the publisher's pasted map link, else an OpenStreetMap search. When maps arrive: they support discovery rather than
dominate it — desktop `Filters | List | Map`, mobile list ↕ map with an
explicit switch.

---

# 18. Images

Consistent aspect ratios (cover banner `3/1`, card poster square, dashboard
poster target `4/3`, event page image `4/3` capped at `max-w-md`; no
full-width hero), `object-cover`, `next/image`
with `sizes` matching the rendered width, `priority` only for the first
image on a page. Decorative images use `alt=""` when the text beside them
says the same thing.

---

# 19. Public pages

Publisher and event pages are first-class web pages: fast, shareable,
indexable, mobile-friendly, and readable without an account. A publisher's
page is theirs — no signup funnel or marketing call to action on it.

---

# 20. Consistency

Once a pattern exists, reuse it: buttons, spacing, cards, forms, badges,
loading and empty states, navigation. A genuinely new reusable pattern is
built once, registered in `ui-registry.md` (run `/imprint`), and followed
everywhere after.

---

# 21. Forms, tables and charts

* Stateful forms use TanStack Form with the shared Zod contract and the
  `Field` / `SelectControl` / `FormSection` primitives.
* Data tables use semantic `<table>` markup with a caption; TanStack Table is
  the engine once a table needs sorting, filtering or pagination (server-side
  for non-trivial data).
* Charts use TanStack Charts through shared components, with an accessible
  name, a text or table fallback, and identity that never rests on colour
  alone (the ticket-click series is also dashed).

---

# 22. Cursors

Anything that acts on click shows a pointer. Tailwind v4's reset dropped
`cursor: pointer` from buttons, so one base rule in `app/globals.css` covers
`button`, `[role="button"]`, `[role="switch"]`, checkable inputs, labels
wrapping them, and `summary`; disabled controls keep the default arrow. Do not
sprinkle `cursor-pointer` per component — add a selector to the base rule.

A control's visible label belongs **inside** its `<button>` so the text is
part of the target (see `Switch`).
