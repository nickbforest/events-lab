# events-lab — UI Rules

The rules the interface follows. Section numbers are stable: code comments cite
them (for example "ui-rules.md §13"). Concrete classes live in
`ui-registry.md`; tokens live in `app/globals.css`.

Last reconciled with the code: 2026-10-03.

---

# 1. Product personality

Modern, refined, friendly and slightly playful, professional and
trustworthy. Content and the next action come first; atmosphere (grid, glow,
gentle motion) adds depth but never competes with them. The landing page is
the most expressive surface; the dashboard is the most restrained.

---

# 2. Visual system

events-lab uses **"Lime + Violet"** (redesigned 2026-10-03, chosen by the
developer from the Auralis, Plasma and Forge references): a near-black
ground, soft raised surfaces, lime for action and violet for atmosphere.

* **Ground:** near-black `--background` (`hsl(240 16% 4%)`); cards are
  `bg-card` through the `surface` utility (hairline + soft depth); floating
  chrome uses `glass`. Borders are translucent white (`--border` 8%,
  `--input` 10%).
* **Accent:** lime `--primary` (`hsl(76 92% 63%)`) with dark
  `--primary-foreground`. One primary (lime) action per view or card.
  Kickers, focus rings, active states and the logo's tail use it; body text never does.
* **Atmosphere:** violet `--glow` and indigo `--glow-2` appear **only** in
  glows, gradients and the grid — never as text, borders of controls, or
  actions. `AmbientBackground` (`hero` / `soft` / `quiet`) is the one way to
  add it; one `text-gradient` phrase per headline at most.
* **Semantic colours:** `--destructive`, `--warning` (postponed),
  `--success`. Always paired with text (§16).
* **Radius:** `rounded-lg` controls, `rounded-xl` small tiles,
  `rounded-2xl` cards and panels, `rounded-3xl` large landing panels,
  `rounded-full` buttons, chips, badges and switches. Avatars are rounded
  squares, never circles.
* **Depth:** `shadow-card` at rest, `shadow-lift` for hover and floating
  elements, `shadow-glow` on the primary button only.
* **Motion:** see §14.
* Dark only: there is no light theme.

Avoid flat rainbow gradients, more than one glow source per section,
glassmorphism outside floating chrome and dialogs, and decoration inside the
dashboard's data areas.

---

# 3. Layout

* Public pages: floating `max-w-6xl` header pill, `max-w-6xl` footer and
  landing sections, `max-w-5xl` lists and event article; `px-6` gutters.
  Public pages other than the landing page sit in `PublicShell`.
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
| Display (page, section and card titles, stats, wordmark) | Bricolage Grotesque (`font-display`, optical-size axis), `font-semibold`, **sentence case**, `tracking-tight` (hero `tracking-[-0.02em]`) |
| Accent (one key phrase per landing headline) | Instrument Serif italic via `font-accent`; with `text-gradient` in the hero and closing CTA, `text-white/90` in section titles |
| Body | Inter (`font-sans`), `text-sm`–`text-lg`, `text-muted-foreground` for supporting copy |
| Labels and kickers | Inter `text-sm font-medium` for field labels; `Eyebrow` pill or `text-xs font-medium uppercase tracking-[0.14em] text-primary` for kickers |
| Metadata (dates, times, handles, URLs, counts) | JetBrains Mono (`font-mono`), `text-xs` |

Hierarchy: kicker (eyebrow or lime small caps) → title (display) → context line (muted).
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

* Keyboard reachable everything; visible `:focus-visible` ring (lime, 2px);
  inputs add a soft lime focus halo.
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

Motion is subtle, premium and performant (transform and opacity only, CSS,
no JavaScript animation library). What exists:

* **Entrances:** `animate-reveal` on the landing hero (staggered with
  `--reveal-delay`), auth card, event article and status screens;
  `reveal-on-scroll` on landing sections (scroll-driven, desktop pointers
  only — touch screens and browsers without support just show the content).
* **Glows are radial gradients** (`bg-radial from-glow/25 to-transparent
  to-70%`), never `blur-*` filters: large blurs made phones paint blank
  tiles while scrolling.
* **Atmosphere:** the landing hero's slowly drifting glows and the floating
  preview chips; the audience wall's columns streaming slowly downward
  (paused on hover).
* **Brand:** the logo idles — every 7s the dot hops and the tail wags
  (`animate-dot-hop`, `animate-tail-wag`).
* **Icons:** feature and step icons move on card hover, each in its own way
  (`animate-spin-slow`, `-wiggle`, `-pop`, `-flash`); step arrows nudge
  toward the next step (`animate-nudge-x` / `-y`).
* **Scrolling:** in-page anchors scroll smoothly; route changes do not
  (`data-scroll-behavior="smooth"`, Next 16).
* **Feedback:** hover lift on cards and the primary button, colour and
  border transitions, `active:scale-[0.98]` on buttons, the dialog scale-in,
  the upload bar, the pinging `Eyebrow` dot.

The dashboard has no ambient motion. Everything stops under
`prefers-reduced-motion` (`globals.css`). Do not add looping animation to
content areas.

---

# 15. Buttons and actions

* All buttons come from `buttonClass` (`components/ui/button.ts`): pill
  shaped, sizes `sm` / `md` / `lg`.
* **Primary:** lime fill with `shadow-glow`, one per view or card
  ("Publish", "Save changes", "Get tickets").
* **Secondary:** translucent fill, `border border-border`.
* **Ghost:** text only, for header and low-emphasis actions.
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
