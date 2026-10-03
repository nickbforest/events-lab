# events-lab — UI Registry

The components and patterns that exist in the code, and the classes they use.
Before building UI, find the closest entry here and match it. After building
UI, run `/imprint` so this file never drifts from the code.

Last reconciled with the code: 2026-10-03 ("Lime + Violet" redesign).

There is no generated shadcn/ui primitive in the codebase yet (`components.json`
is configured for one). Base controls are hand-written below, styled from the
tokens in `app/globals.css`. Add a shadcn primitive only when a pattern here
cannot cover the need, and register it.

---

# Inventory

| Component | File | Kind |
| --- | --- | --- |
| `buttonClass` | components/ui/button.ts | primitive |
| `Eyebrow` | components/ui/eyebrow.tsx | primitive |
| `AmbientBackground` | components/ui/ambient-background.tsx | primitive |
| `Avatar` | components/ui/avatar.tsx | primitive |
| `EmptyState` | components/ui/empty-state.tsx | primitive |
| `Switch` | components/ui/switch.tsx | primitive |
| `StatusMessage`, `statusPrimaryActionClass`, `statusSecondaryActionClass` | components/ui/status-message.tsx | primitive |
| `Skeleton`, `LoadingRegion` | components/ui/skeleton.tsx | primitive |
| `TrackView`, `TicketLink` | components/analytics/ | analytics |
| `Field`, `SelectControl`, `fieldControlClass`, `fieldDescribedBy`, `formFooterClass`, `formSubmitWideClass` | components/forms/field.tsx | form primitive |
| `FormSection` | components/forms/form-section.tsx | form primitive |
| `ImageUploader` | components/forms/image-uploader.tsx | form primitive |
| `AuthCard`, `FormAlert`, `authSubmitClass` | components/auth/auth-card.tsx | auth shell |
| `SiteHeader`, `SiteFooter`, `WordmarkLink`, `LogoMark`, `PublicShell` | components/layout/ | public chrome |
| `DashboardShell`, `DashboardHeader` | components/layout/ | dashboard chrome |
| `Panel`, `PanelEmpty`, `StatsCard`, `StatsCardRow`, `RangeTabs`, `TrendChart` | components/dashboard/ | dashboard |
| `EventCard`, `EventStatusBadge` | components/events/ | events |
| `QueryProvider` | components/providers/query-provider.tsx | infrastructure |
| `EventForm` (+ `event-form-values.ts`) | app/dashboard/events/event-form.tsx | page-local |
| `NewEventProvider`, `NewEventTrigger`, `useEventDialog` | app/dashboard/events/event-dialog.tsx | page-local |
| `EventRowActions` | app/dashboard/events/event-row-actions.tsx | page-local |
| `EventLifecycle` | app/dashboard/events/[id]/edit/event-lifecycle.tsx | page-local |
| `ProfileForm`, `ProfileMediaField` | app/dashboard/profile/ | page-local |
| `EmailForm`, `PasswordForm` | app/dashboard/settings/ | page-local |
| Login, signup, forgot/update password forms, `ResendButton` | app/auth/ | page-local |
| `not-found`, `error`, `global-error`, dashboard `error` / `not-found` / `loading` | app/ | route files |

Generic, reusable pieces live in `components/`; a component used by one route
lives beside that route. Promote it to `components/` the second time it is
needed.

## Planned, not built

Do not assume these exist: toast, tooltip, dropdown menu, drawer, pagination,
confirmation dialog, gallery uploader, location picker, event map, date-range
picker, discovery filters (removed with `/discover`), organization
components, moderation components.

---

# Captured Patterns

Entries written by `/imprint` from shipped code. These are the authoritative
classes — match them when building anything of the same type.

### Design foundation (tokens and utilities)

File: app/globals.css
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | page `bg-background` (`hsl(240 16% 4%)`); cards `bg-card` via `surface` |
| Border | `border-border` (white 8%); inputs `border-input` (white 10%); hover lift to `border-white/15`–`/20` |
| Border radius | controls `rounded-lg`; small tiles `rounded-xl`; cards `rounded-2xl`; landing panels `rounded-3xl`; buttons, chips, badges, pills `rounded-full` |
| Text — primary | headings `font-display` (Bricolage Grotesque) `font-semibold tracking-tight`, sentence case; key phrase `font-accent` (Instrument Serif italic) |
| Text — secondary | `text-muted-foreground`; metadata (dates, handles, URLs, counts) `font-mono text-xs` |
| Spacing | landing sections `py-24 md:py-32`; dashboard pages `px-6 py-10 md:px-10` |
| Hover state | translucent white fills `bg-white/[0.04]`–`[0.08]` |
| Shadow | `shadow-card` (rest), `shadow-lift` (hover/floating), `shadow-glow` (primary only) |
| Accent usage | lime `primary` for actions; `glow`/`glow-2` (violet/indigo) for atmosphere only |

**Pattern notes:**
Utilities defined with `@utility` in `globals.css`: `surface` (card fill,
hairline, `shadow-card` — always pair it with a `rounded-*` class), `glass`
(translucent blurred chrome), `bg-grid` (56px grid, radially masked) and
`text-gradient` (lime → pale tint, for one highlighted headline phrase).
Motion classes: `animate-reveal` (stagger with `[--reveal-delay:120ms]`),
`reveal-on-scroll` (scroll-driven fade-up, desktop pointers only, progressive enhancement),
`animate-drift`/`-slow` (background glows), `animate-float`/`-delayed`
(floating chips), and the native `<dialog>` scale-in. All of them stop under
reduced motion. Never use violet for text or controls.

### Button

File: components/ui/button.ts
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | primary `bg-primary`; secondary `bg-white/[0.04]`; ghost none; destructive none |
| Border | secondary `border border-border`; destructive `border-destructive/40` |
| Border radius | `rounded-full` |
| Text — primary | `font-medium`; sizes `sm` `px-4 py-2 text-sm`, `md` `px-6 py-3 text-sm`, `lg` `px-7 py-3.5 text-base` |
| Text — secondary | ghost `text-muted-foreground` |
| Spacing | `gap-2` between icon and label |
| Hover state | primary `-translate-y-px brightness-110`; secondary `border-white/20 bg-white/[0.08]`; ghost `bg-white/[0.06]`; destructive `bg-destructive/10`; all `active:scale-[0.98]` |
| Shadow | primary `shadow-glow` |
| Accent usage | primary only — one per view or card |

**Pattern notes:**
`buttonClass({ variant, size, className })` returns a class string, so the
same button styles a `<button>`, a `<Link>`, a plain `<a>` and a
`TicketLink`, in Server and Client Components alike. Never restate button
classes inline; the named helpers (`authSubmitClass`, `formSubmitWideClass`,
`statusPrimaryActionClass`, `statusSecondaryActionClass`) are thin aliases
of it. Disabled and `aria-disabled` drop to 50% and ignore the pointer.

### Eyebrow

File: components/ui/eyebrow.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `bg-white/[0.03]` |
| Border | `border border-border` |
| Border radius | `rounded-full` |
| Text — primary | `text-xs font-medium text-muted-foreground` |
| Text — secondary | n/a |
| Spacing | `px-3 py-1`, `gap-2` |
| Hover state | none |
| Shadow | none |
| Accent usage | optional `dot`: a pinging lime dot |

**Pattern notes:**
The kicker for landing sections, `StatusMessage` and the publisher type.
Dashboard headers keep their plainer lime small-caps kicker. Use `dot` only
for a live or free hook, at most once per page.

### AmbientBackground / PublicShell

File: components/ui/ambient-background.tsx, components/layout/public-shell.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `hero`: `bg-grid` + `bg-glow/25` top bloom + drifting `glow-2` and `primary` blobs; `soft`/`quiet`: a top radial wash of `--glow` at 16% / 9% |
| Border | none |
| Border radius | n/a |
| Text — primary | n/a |
| Text — secondary | n/a |
| Spacing | fills its parent (`absolute inset-0 -z-10`) |
| Hover state | none |
| Shadow | none |
| Accent usage | atmosphere only |

**Pattern notes:**
Decorative, `aria-hidden`, `pointer-events-none`. The parent must be
`relative isolate`. `hero` is for the landing hero and auth
(`app/auth/layout.tsx`); `soft` comes through `PublicShell`, which wraps the
whole public page (header included) so the wash starts behind the floating
bar — used by the publisher page, event page, `not-found` and `error`;
`quiet` sits behind the dashboard `<main>`. Soft washes are radial gradients,
never blurred blobs, so a clipping parent never shows a hard edge. Every
glow uses `bg-radial from-<color>/N to-transparent to-70%` — no `blur-*`.

### Landing page

File: app/page.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | hero `AmbientBackground variant="hero"`; How it works a centred radial `--glow` wash; CTA panel `surface` + `bg-grid` + bottom glow |
| Border | cards `surface`; the steps' connecting line `border-dashed border-white/15` |
| Border radius | feature, step and preview cards `rounded-3xl`; CTA panel `rounded-[2rem]` |
| Text — primary | hero `font-display text-5xl … lg:text-8xl font-semibold leading-[0.95] tracking-[-0.035em]`; section titles `text-3xl md:text-5xl font-semibold tracking-tight` |
| Text — secondary | `text-lg leading-relaxed text-muted-foreground` |
| Spacing | sections `px-6 py-24 md:py-32`; hero `pt-40 pb-24 md:pt-48 md:pb-32`; section heading `mb-14` |
| Hover state | feature cards `hover:-translate-y-1 hover:border-white/15 hover:shadow-lift` + a violet corner glow; icon tile `group-hover:scale-110 shadow-glow` plus the icon's own motion |
| Shadow | `shadow-card` / `shadow-lift` |
| Accent usage | hero CTA, `text-gradient` on one phrase per headline, feature icon tiles `bg-primary/10 text-primary` |

**Pattern notes:**
Order: hero (headline, copy, primary + secondary CTA — no eyebrow, removed
at the developer's request — then a decorative publisher-page preview of a
made-up New York organiser with two floating chips from `xl`), Features (bento,
`md:grid-cols-3` with two `md:col-span-2` cards; each icon has its own hover
motion via `iconMotion`), How it works (three steps with icons — `UserPlus`,
`CalendarPlus`, `Send` — and a small bare lime arrow centred in each gap —
no circle — pointing right from `md`, down on phones), Who it's for (`AudienceWall`, `app/audience-wall.tsx`, pure CSS: the
heading and a caption naming every audience come first; below them, a
pyramid of seven centred columns — the centre tallest, each step out
shorter (100/82/64/46% of the wall), so the lower edge draws the App Store
V — whose audience cards stream slowly downward forever
(`animate-stream-down`: each column holds its five cards twice and slides by
half its height, 36–54s per loop, negative delays so no two move in step).
Cards are rounded `[1.4rem]`–`[2rem]`, with an
icon chip and the name in `font-display`, on soft two-stop gradients (violet,
indigo, lime, teal, rose, amber, sky, plum, graphite, pearl), at
`opacity-50` — full colour and a slight scale on hover; hovering a column
pauses it. The wall is `h-[24rem]`/`30rem`/`36rem`; each column is masked to fade in
at the top and out at its own lower edge, so cards seem to arrive from above
and leave below. Phones show the centre 3 columns, `md` 5, `xl` 7; cards are
`size-[6.5rem]`/`32`/`[9.5rem]`/`44`. Cards are
`aria-hidden`; the caption carries the list. Earlier versions — chip
showcase, orbit, poster wall, icon cascade, levitating V — were rejected), closing CTA panel. Each
headline has one key phrase in `font-accent text-gradient`: "destination.",
"tool,", "three steps.", "gather.", "60 seconds." — the marquee was removed
2026-10-03. Section
ids `features`, `how-it-works` and `audience` match `LANDING_SECTIONS`;
anchor clicks scroll smoothly (`html { scroll-behavior: smooth }` with
`data-scroll-behavior="smooth"` on `<html>`, so route changes still jump).
Illustrations are sample UI and `aria-hidden`; the text beside them says the
same thing. Headings use `SectionHeading` (page-local).

### SiteHeader

File: components/layout/site-header.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `glass` (card 70% + `backdrop-blur`) on the floating bar; header wrapper transparent |
| Border | `glass` hairline `border-border` |
| Border radius | bar `rounded-full`; links and buttons `rounded-full` |
| Text — primary | buttons via `buttonClass` (`text-sm font-medium`) |
| Text — secondary | section links `text-sm text-muted-foreground` |
| Spacing | wrapper `px-4 pt-3 sm:px-6 sm:pt-4`; bar `h-16 max-w-6xl pr-2.5 pl-5 sm:pl-6` |
| Hover state | links `hover:bg-white/[0.06] hover:text-foreground` |
| Shadow | `shadow-card` |
| Accent usage | `Get started` (primary button) and the wordmark |

**Pattern notes:**
A floating glass pill, sticky with a small top gap so the page scrolls under
it. It carries exactly two actions — a ghost `Log in` and a primary `Get
started` (`buttonClass({ size: "sm" })`) — to `routes.auth.signIn()` and
`routes.auth.signUp()`. `showSections` (landing page only) adds the in-page
anchors from `LANDING_SECTIONS` (Features, How it works, Who it's for),
hidden below `md`. No other page passes it: a publisher's page is not a
marketing funnel (ui-rules §19). The landing `<main>` is pulled up
(`-mt-[4.75rem] sm:-mt-[5rem]`) so the hero grid starts behind the bar;
other public pages get the same effect from `PublicShell`.

The wordmark is `WordmarkLink` (`components/layout/wordmark-link.tsx`, added
2026-09-26), shared with the dashboard sidebar. It takes the destination:
`routes.home()` here, `routes.dashboard.root()` (Overview) in the dashboard.
From another page it is a client-side `<Link>`; on the page it already points
at it renders a plain `<a>`, so clicking it reloads the page. Never hand-roll
the wordmark as a link again.

### SiteFooter

File: components/layout/site-footer.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | page ground with a `bg-radial from-glow/25` glow at the bottom edge |
| Border | `border-t border-border`; bar `border-t`; a `via-glow/60` gradient hairline on top |
| Border radius | Back to top pill `rounded-full` |
| Text — primary | sign-off `font-display text-3xl md:text-4xl font-semibold leading-[1.1] tracking-tight` |
| Text — secondary | group labels `font-mono text-xs text-muted-foreground`; links `text-sm text-foreground/80`; copyright `font-mono text-xs` |
| Spacing | `max-w-6xl px-6 pt-20`; groups `gap-8`; bar `mt-16 py-6` |
| Hover state | links `hover:text-primary` + arrow slides in; pill `hover:border-white/20` |
| Shadow | none |
| Accent usage | wordmark, the sign-off accent phrase, the giant mark's dot and tail at 30% |

**Pattern notes:**
Redesigned again 2026-10-03: the wordmark over a large sign-off ("Made for
people who bring *people together.*", accent in `font-accent
text-gradient`), two link groups (Product → `/#id` sections, Account) whose
links reveal an `ArrowUpRight` on hover, a bar with the mono copyright and a
"Back to top" pill (`href="#top"`, which browsers scroll to the top by
spec), then an oversized decorative `Wordmark` (`text-[clamp(4.5rem,21vw,19rem)]`,
`text-white/[0.07]`, dot and tail `text-primary/30`) fading out through a
`mask-image` gradient into the bottom edge, over a violet glow. No sales
CTA: it also closes publishers' pages (§19).

### DashboardShell (sidebar)

File: components/layout/dashboard-shell.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | mobile bar `bg-background/80 backdrop-blur-xl`; `md:bg-card/50`; main carries `AmbientBackground variant="quiet"` |
| Border | `border-b border-border` mobile, `md:border-r` |
| Border radius | nav items `rounded-xl`; burger `rounded-full` |
| Text — primary | active `text-foreground`, `text-sm font-medium`; active icon `text-primary` |
| Text — secondary | idle `text-muted-foreground` |
| Spacing | shell `md:p-6`, items `px-3 py-2.5`, nav `gap-1` |
| Hover state | `hover:bg-white/[0.04] hover:text-foreground` |
| Shadow | none |
| Accent usage | active item: lime icon + a `w-0.5 h-4 bg-primary` bar on its left edge |

**Pattern notes:**
The sidebar wordmark leads to Overview, never to the public landing page —
inside the dashboard, "click the logo" means "back to the start of the
dashboard". It uses `WordmarkLink` (see `SiteHeader`). Nav items take their
hrefs from `routes.dashboard.*`.

Nav items pair a `size-4` lucide icon with a `gap-3` label; the active item is
marked with `aria-current="page"`, `bg-white/[0.06] ring-1 ring-border`, a
lime icon and a short lime bar on its left edge. Order is fixed: Overview,
Events, Profile, Settings in the main nav (Settings added 2026-09-21), then a
`border-t` footer holding the public preview link (`font-mono text-xs`,
`ExternalLink` at `size-3`) and Sign out. The preview link opens `routes.publisherPreview` in a new tab (`target="_blank" rel="noopener noreferrer"`, with an `sr-only` ", opens in a new tab"), like every preview link in the dashboard.
Sign out is always last and uses the same idle-nav-item treatment rather than
a destructive color — it is a navigation action, not a dangerous one. It is a
`<form action={signOutAction}>`, so it works without client JavaScript.

Below `md` the sidebar is a sticky `h-16` bar — wordmark left, burger right
(`Menu` / `X` at `size-5` in a `size-10` button, `aria-expanded`,
`aria-controls="dashboard-menu"`). Opening it drops the same nav, preview
link and Sign out below the bar, pushing the page down rather than
overlaying it. The menu remembers the path it was opened on, so any
navigation closes it without an effect; Escape closes it too. Added
2026-10-03, closing the mobile-sidebar part of `build-plan.md` M13.

### DashboardHeader

File: components/layout/dashboard-header.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | none (sits on the page ground) |
| Border | none |
| Border radius | n/a |
| Text — primary | `font-display text-3xl font-semibold tracking-tight md:text-4xl` |
| Text — secondary | kicker `text-xs font-medium uppercase tracking-[0.14em] text-primary`; description `text-sm text-muted-foreground` |
| Spacing | `mb-8 md:mb-10`, `gap-4`, kicker `mb-2`, description `mt-1.5` |
| Hover state | none |
| Shadow | none |
| Accent usage | the kicker, and only the kicker |

**Pattern notes:**
Every dashboard screen opens with this and nothing else — a lime small-caps
kicker, the sentence-case display title, an optional context line, then the screen's
actions pushed right on `items-end`. Do not hand-roll a title block in a page;
add a prop here instead. Actions are passed as nodes so a screen can carry a
ghost + solid pair (Events) or a segmented control (Overview). The actions
row is `w-full` below `sm`, so a page's buttons can stretch across the
screen there (`w-full` / `flex-1` + `justify-center`) and sit at their own
width from `sm`. On Events, New is the wider of the pair: `flex-1` on
mobile, `sm:min-w-36` from `sm`; both are `buttonClass({ size: "sm" })`.

### Panel

File: components/dashboard/panel.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `surface` (`bg-card`) |
| Border | `surface` hairline; header split `border-b` |
| Border radius | `rounded-2xl` |
| Text — primary | `font-display text-base font-semibold tracking-tight` |
| Text — secondary | `text-xs text-muted-foreground` |
| Spacing | header `px-6 py-5`, body `p-6`, rows `py-3` |
| Hover state | action pill `hover:bg-white/[0.06] hover:text-foreground`, arrow nudges up-right |
| Shadow | `shadow-card` via `surface` |
| Accent usage | none |

**Pattern notes:**
The card used for every titled block on the dashboard — chart, upcoming
events, most viewed. Header is always hairline-separated from the body; the
optional action is a small pill link with an `ArrowUpRight` on the right
("All"), never a button.
Lists inside use `divide-y divide-border` with `first:pt-0 last:pb-0` so the
row rhythm meets the padding cleanly. Use `PanelEmpty` for the nothing-yet
line rather than the full `EmptyState` — inside a panel the surrounding header
already says what is empty.

### StatsCard / StatsCardRow

File: components/dashboard/stats-card.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | each tile `surface`; accent tile adds a `bg-radial from-primary/15` corner glow |
| Border | `surface` hairline |
| Border radius | `rounded-2xl`; icon tile `rounded-xl` |
| Text — primary | `font-display text-4xl font-semibold tracking-tight tabular-nums md:text-5xl` |
| Text — secondary | label `text-sm font-medium text-muted-foreground` |
| Spacing | tile `p-6`, label-to-value `mb-5`; row `gap-4 sm:grid-cols-2` |
| Hover state | none — a stat tile is not interactive |
| Shadow | `shadow-card` |
| Accent usage | `accent` prop: lime value, lime icon tile, corner glow |

**Pattern notes:**
Each tile is its own `surface` card; `StatsCardRow` lays them out
(`gap-4`, stacked below `sm`). The optional `size-4` lucide icon sits
top-right in a `size-9 rounded-xl` tile, `aria-hidden` — it labels nothing
the text does not already say. At most one tile per row carries
`accent`; two competing lime numbers read as a chart, not a hierarchy. Values
are always `tabular-nums` so they do not jitter between range switches.

### RangeTabs

File: components/dashboard/range-tabs.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | group `bg-white/[0.03]`; active `bg-primary` |
| Border | group `border border-border` |
| Border radius | group and segments `rounded-full` |
| Text — primary | active `text-primary-foreground` |
| Text — secondary | idle `text-muted-foreground`, all `text-xs font-medium` |
| Spacing | group `p-1`; segments `px-3.5 py-1.5` |
| Hover state | idle `hover:bg-white/[0.06] hover:text-foreground` |
| Shadow | active `shadow-glow` |
| Accent usage | the selected segment |

**Pattern notes:**
A segmented control built from `Link`s, not buttons — the selection drives a
server query, so it belongs in the URL and the page stays a Server Component.
Selection is marked with `aria-current="page"`, and the group is a `<nav>` with
an `aria-label`. Segments are pills inside a pill track.
Reuse this shape for any other server-driven segmented filter.

### TrendChart

File: components/dashboard/trend-chart.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | none — it sits inside a `Panel` |
| Border | chart grid `var(--border)`; table wrapper `border border-border` |
| Border radius | table wrapper `rounded-xl` |
| Text — primary | table values `font-mono text-xs tabular-nums` |
| Text — secondary | axes `font-mono text-[11px]`; legend, summary and table head `text-xs font-medium text-muted-foreground` |
| Spacing | legend `mt-4 gap-x-6`, table view `mt-4` |
| Hover state | TanStack Charts grouped x-focus, crosshair, focus markers, tooltip |
| Shadow | none in application-owned markup |
| Accent usage | series only: visits `#7E9F30`, clicks `#8B6CFF` (violet, re-validated 2026-10-03) |

**Pattern notes:**
TanStack Charts owns the responsive SVG, axes, animation, keyboard focus, and
tooltip at a fixed `190px` height with a `720px` initial server-render width.
Both series share one y-axis; a second scale would invent a correlation the
data does not have. The two series colours are the only hardcoded hex values
allowed in the UI: they are the accent stepped down until they pass the
colour-vision and dark-surface checks, so re-validate before changing them.
Ticket clicks additionally carries a `6 4` dash, and the legend swatch mirrors
the dash so identity never rests on colour alone. Every chart includes a
descriptive label and the `View as table` disclosure with all plotted values.

### Field / FormSection

File: components/forms/field.tsx, components/forms/form-section.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | control `bg-white/[0.03]`, focus `bg-white/[0.05]` |
| Border | control `border border-input`, hover `border-white/20`, focus `border-primary/60`, invalid `aria-invalid:border-destructive/60`; section heading `border-b border-border` |
| Border radius | control `rounded-lg` |
| Text — primary | control `text-base sm:text-sm`; label `text-sm font-medium text-foreground/90` |
| Text — secondary | hint `text-xs leading-relaxed text-muted-foreground` |
| Text — error | `mt-1.5 text-xs leading-relaxed text-destructive` |
| Spacing | control `px-4 py-2.5`, label `mb-2`, hint/error `mt-1.5`, fields `space-y-5`, section `mb-10` |
| Hover state | `hover:border-white/20` |
| Shadow | inset `shadow-[inset_0_1px_2px_…]`; focus adds a 4px lime ring at 14% |
| Accent usage | focus border and ring; `FormSection` heading carries a `h-4 w-1 rounded-full bg-primary` bar |

**Pattern notes:**
`fieldControlClass` is the single source for input, textarea and select
styling — import it rather than restating the classes, so the three never
drift apart. Every control has a real `<label htmlFor>`.

Selects render through `SelectControl` (same file, added 2026-09-26), never a
bare `<select>`. A native select draws its own box, ignores padding and comes
out shorter than the inputs beside it. `SelectControl` drops the native
appearance (`appearance-none`), pins the height to the input's
`h-[2.625rem]` (42px), reserves `pr-10` and draws a `ChevronDown` (`size-4
text-muted-foreground`, `right-4`, `pointer-events-none`) in the arrow's
place. It takes every `<select>` prop, so wiring and `aria-*` are unchanged.

A field carries at most one message: `error` replaces `hint` rather than
stacking under it, because once a control is invalid the correction is the only
guidance that matters. Wire the control with `fieldDescribedBy({ id, hasHint,
hasError })` — it returns `${id}-error` or `${id}-hint` so `aria-describedby`
always points at the message actually on screen — and set `aria-invalid` when
an error is present. Never surface an error through colour alone.

Sections are grouped by `FormSection`, whose display heading with a short
lime bar, over a hairline rule, is the only section marker used in dashboard
forms. Two-column field grids
are `sm:grid-cols-2` with `gap-5`. Its optional `description` (added
2026-09-26) sits under the rule as `text-sm text-muted-foreground` — use it
when the heading alone does not say what the section is for, and keep it to
one line.

Submit buttons use `buttonClass()` (see **Button**); `formSubmitClass` was
removed on 2026-10-03. The button swaps its label to a present participle
while submitting ("Saving…").

`formSubmitWideClass` is `buttonClass` plus `w-full sm:ml-auto sm:w-48`,
for a full-page form (Profile, Settings): below `sm` the submit spans the form
edge to edge under its status line (`formFooterClass`, `flex flex-col gap-4`);
from `sm` the footer is a row, status left, button right at one fixed width
so every form's submit matches. `ml-auto` keeps it right even when the status
line is empty — `justify-between` alone put a lone button on the left.
Full-width buttons are a mobile treatment only — desktop buttons size to
their labels.

`fieldControlClass` is `text-base` below `sm` and `sm:text-sm` above: iOS
Safari zooms into any focused control under 16px and stays zoomed, which
made pages pannable. `SelectControl` follows the taller input
(`h-[2.875rem] sm:h-[2.625rem]`).

A value the owner can see but not change (username, current email) is a real
`<input readOnly disabled>` with `fieldControlClass` plus `cursor-not-allowed
opacity-60`, and its hint says why it is fixed. Never render it as plain text:
it has to read as a field.

### AuthCard

File: components/auth/auth-card.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `surface` card; page has `AmbientBackground variant="hero"` from `app/auth/layout.tsx` |
| Border | `surface` hairline; a `via-primary/50` gradient hairline across the top edge |
| Border radius | `rounded-2xl` |
| Text — primary | heading `font-display text-2xl font-semibold tracking-tight` |
| Text — secondary | subheading and body `text-sm (leading-relaxed) text-muted-foreground` |
| Spacing | card `p-7 sm:p-8`, wordmark `mb-8`, heading `mb-1.5`, subheading `mb-8`, fields `space-y-5`, footer `mt-6` |
| Hover state | submit via `buttonClass`; links `underline-offset-4 hover:underline` |
| Shadow | `shadow-card` |
| Accent usage | wordmark, footer link (`font-medium text-primary`), the submit fill |

**Pattern notes:**
The shell for every signed-out screen — signup, login, forgot password, update
password, check email, link expired. Width is fixed at `max-w-sm` and the page
centres it with `flex flex-1 flex-col items-center justify-center px-6 py-16`.
Do not hand-roll this frame in a new auth route; pass `heading`, `subheading`
and an optional `footer` instead.

`authSubmitClass` is `buttonClass({ className: "w-full" })`; every auth form
disables it while submitting and swaps the label to a present participle
("Logging in…"). Secondary actions inside the card use
`buttonClass({ variant: "secondary" })` — one lime button per card.

Form-level failures render through `FormAlert` (`role="alert"`, a
`rounded-xl border-destructive/30 bg-destructive/10` box) directly above the
submit button; field-level failures belong to `Field`. Advisory
confirmations — username availability, "link resent" — use an
`aria-live="polite"` paragraph in `text-xs text-primary`, never an alert,
because they are not errors.

A notice carried in from another screen (login's `?notice=password-changed`)
is a `role="status"` paragraph in `mb-5 text-sm leading-relaxed
text-primary` above the form. The card fades up on load (`animate-reveal`). Only known notice values render, so the URL can
never inject text.

### ImageUploader

File: components/forms/image-uploader.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | empty `bg-white/[0.015]`, hover `bg-primary/[0.03]`; with an image `bg-secondary` |
| Border | empty `border border-dashed border-white/15`; with an image `border border-border` |
| Border radius | `rounded-xl`; corner chips `rounded-full` |
| Text — primary | "Click to upload" `text-sm font-medium text-foreground/90`; label `text-sm font-medium text-foreground/90` |
| Text — secondary | constraint line `text-xs text-muted-foreground` |
| Spacing | `px-6 py-12`, `gap-3`; upload icon in a `size-10 rounded-xl` tile |
| Hover state | `hover:border-primary/50` |
| Shadow | none |
| Accent usage | upload icon, `focus-within:border-primary`; busy spinner, label and bar |

**Pattern notes:**
The dashed frame is a `<label>` wrapping an `sr-only` file input, never a
styled `div` with a click handler — that keeps it keyboard-reachable and
announced as a file control. Dashed border is reserved for "something goes
here" surfaces (this and `EmptyState`); a filled panel always uses a solid
border. The size and format constraint is always stated up front rather than
surfaced as an error after the fact. `description` states what the image is
used for below the frame, kept separate from the in-frame format/size `hint`;
`className` constrains the frame, since a square target should not stretch the
width of a form.

With `previewUrl` the frame is a different element: a solid-bordered `div`
(`border border-border bg-secondary`) showing the image alone, `object-cover`,
with no scrim, icon or "click to upload" text over it. Its two actions sit
as icon chips in the top-right corner (`absolute top-2 right-2 flex gap-2`):

* **Replace** — a `Pencil` inside a `<label>` that wraps the same `sr-only`
  file input, with `focus-within:ring-2 focus-within:ring-ring` so keyboard
  focus shows on the chip.
* **Remove** — a `Trash2` `<button>`, `hover:text-destructive`, rendered only
  when the caller passes `onRemove`.

Both chips are `size-9 rounded-full bg-black/60 text-white ring-1
ring-white/15 backdrop-blur-sm hover:bg-black/80` so they read on light and dark photos, carry an `sr-only`
name ("Replace cover image") and a matching `title`, and are always visible
rather than hover-only, because touch screens have no hover.

While `busy`, the image dims to `opacity-50`, the chips hide, and a
`bg-black/40` overlay centres a spinning `LoaderCircle` and the `busyLabel`
(default "Uploading…", "Removing…" during a removal), both `text-primary`.
The input is disabled and the frame carries `aria-busy`. A
`role="progressbar"` track runs along the bottom edge (`h-1 bg-white/10`) with
a `w-2/5 bg-primary` bar sweeping across it (`animate-upload-progress` in
`globals.css`). It is indeterminate on purpose: uploads go through Server
Actions, which report no byte progress, so never show a percentage here.
Under reduced motion the bar stands still at full width. A caller that has
the file shows it at once as a local `blob:` preview under the bar.

An `error` replaces `description` below the frame in `text-destructive`,
exactly as `Field` swaps hint for error. It is a client component: it owns
the change handler, and it resets the input so choosing the same file twice
still fires.

Profile media uses it through `ProfileMediaField`, which uploads on selection
rather than on the form's Save: an image is its own write, so a failed upload
never discards unsaved text. It also wires `onRemove`, which clears the image
on the server; success is announced in the same `aria-live` line ("Cover
image removed."). The event poster wires `onRemove` to clear the form field
only; saving the event deletes the stored file it no longer points at, so
the removal takes effect on Save, like every other event field. Avatar frames are `aspect-square px-3 py-6` in a
`10rem` column; covers are `aspect-[3/1] min-h-40`.


### Avatar

File: components/ui/avatar.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `bg-gradient-to-br from-glow/40 to-glow-2/30` behind the letter fallback |
| Border | `ring-1 ring-border` |
| Border radius | `rounded-xl` (publisher header overrides `rounded-2xl`), never a circle |
| Text — primary | `font-display font-semibold`; size set by the caller |
| Text — secondary | n/a |
| Spacing | none; `grid place-items-center` centres the letter |
| Hover state | none; hover belongs to the surrounding link |
| Shadow | none (publisher header adds `shadow-lift`) |
| Accent usage | none |

**Pattern notes:**
A publisher's image, or the first letter of their name when there is none.
Every existing letter block was replaced by this, so no page hand-rolls one.
The caller sets size: `size-20 rounded-2xl text-3xl shadow-lift` in the
publisher header, `size-10` beside a byline.
`sizes` must match the rendered width so next/image does not fetch a larger
file than it shows. It is `aria-hidden` because the name is always printed
beside it; if a use ever shows it alone, give it an accessible name first.

### Publisher page header

File: app/publisher/[username]/page.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `PublicShell` soft wash; cover `bg-secondary` with a bottom fade to `background` |
| Border | header `border-b border-border` |
| Border radius | none on the cover; meta chips `rounded-full` |
| Text — primary | `font-display text-4xl font-semibold tracking-tight md:text-5xl` |
| Text — secondary | handle `font-mono text-sm text-muted-foreground`; meta chips `text-xs` |
| Spacing | header `px-6 py-14 md:py-16`, avatar-to-text `gap-6` |
| Hover state | website chip `hover:border-primary/40 hover:text-primary` |
| Shadow | avatar `shadow-lift` |
| Accent usage | none beyond hover — the publisher type is an `Eyebrow` |

**Pattern notes:**
The cover is an `aspect-[3/1] max-h-80 w-full` banner above the header, loaded
with `priority` because it is the first thing on the page. It renders only
when a cover exists; with none, the header starts the page unchanged, so a
publisher without images sees the page exactly as before. The avatar sits
beside the name, not overlapping the cover. Link previews use the cover, or
failing that the avatar, as their Open Graph image. The publisher can remove
the cover from the dashboard, and the page then starts at the header.

The lists are headed "Upcoming events" (with a mono count pill) and "Past
events" (muted) in `font-display text-xl font-semibold`. The page ends with the
event lists; there is no "Publishing your own events?
Claim your events-lab page" call to action (removed 2026-09-26). A
publisher's page is theirs, not a signup funnel. `?preview=1` hides the site
header for a publisher previewing their own page.

### Account forms (ProfileForm, EmailForm, PasswordForm)

Files: app/dashboard/profile/profile-form.tsx, app/dashboard/settings/*.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | none; fields via `fieldControlClass` |
| Border | profile footer `border-t border-border pt-6` |
| Border radius | inherited from `Field` and `buttonClass` |
| Text — primary | via `Field` |
| Text — secondary | footer note `text-xs text-muted-foreground` |
| Spacing | fields `space-y-5`; footer `formFooterClass` |
| Hover state | submit via `buttonClass` |
| Shadow | submit `shadow-glow` |
| Accent usage | the submit, and success lines in `text-xs text-primary` |

**Pattern notes:**
Each is a TanStack Form client component rendered by a thin Server Component
page that loads the data. Below `sm` the footer stacks the status line
(`empty:hidden` when there is nothing to say) above a full-width
`formSubmitWideClass` button; from `sm` the status sits left and the button
right. Success is an `aria-live="polite"` line in
`font-mono text-xs text-primary` ("Profile saved."); a result that is not yet
final says so ("Confirmation pending for …"), never "changed". Status lines
are `text-xs text-primary`. A form whose
success leaves the page (password change signs out) states that consequence in
the footer before submit instead.

The profile Media grid is `sm:grid-cols-[10rem_minmax(0,1fr)]`, never a bare
`1fr`: the cover's `min-h-40` through its 3:1 ratio gives it a 480px
min-content width, which a `1fr` track honours and the page then overflows.

Server field errors are held beside TanStack's own and cleared when that field
is edited, so a stale server message never outlives the input that caused it.

Settings stacks one `FormSection` per concern (Email, Password), each with its
own submit, so one failing never blocks the other. The profile form is a single
submission with a closing `border-t` footer. Password fields autocomplete as
`current-password` / `new-password` next to a hidden `username` input, so
password managers file the change under the right account.

### EventDialog (NewEventProvider / NewEventTrigger / useEventDialog)

File: app/dashboard/events/event-dialog.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `bg-card`; backdrop `backdrop:bg-black/70 backdrop:backdrop-blur-sm` |
| Border | `border border-border`; header `border-b`, footer `border-t` |
| Border radius | `rounded-2xl`; close button `rounded-full` |
| Text — primary | header `font-display text-lg font-semibold tracking-tight` |
| Text — secondary | "Full editor" `text-sm font-medium text-muted-foreground`, underline on hover |
| Spacing | header/footer `px-6 py-4`, body `px-6 pt-6` |
| Hover state | close `hover:bg-white/[0.08] hover:text-foreground` |
| Shadow | `shadow-lift`; opens with `dialog-in` (globals.css) |
| Accent usage | the single primary submit in the footer |

**Pattern notes:**
Creating an event is always a modal over the events list; there is no
standalone create page, so there is one create path rather than two.

Built on the native `<dialog>` with `showModal()`, never a hand-rolled overlay
— focus trapping, Escape, `inert` background and top-layer stacking all come
from the platform. Sizing is `max-h-[90vh] w-[min(46rem,calc(100vw-2rem))]`,
and the panel is a flex column: fixed header, `min-h-0 flex-1 overflow-y-auto`
body, footer pinned with a solid `bg-card` so content scrolls under it rather
than through it. Backdrop clicks are detected by comparing `event.target` to
the dialog element.

The form is mounted only while the dialog is open, so it resets between
creations instead of keeping the last event's half-typed values.

One dialog serves creating and editing. `openEdit(event)` fills it, and the
form is keyed by event id so switching rows rebuilds it instead of leaving
the previous event's values in the inputs. The heading and the submit change
with the mode; a dialog edit closes back to the list rather than navigating.

Multiple triggers share one dialog through `NewEventProvider` — never mount a
second copy per button, or every field id on the page duplicates.
`NewEventTrigger` takes its classes from the caller, so the same dialog opens
from a header button and from an `EmptyState` `actionSlot`. Rows open it for
editing with `useEventDialog().openEdit(event)`; the footer then carries a
"Full editor" link to `routes.dashboard.editEvent(id)`.

### EventForm

File: app/dashboard/events/event-form.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | inherits; controls via `fieldControlClass` |
| Border | section rule `border-b border-border`; dialog footer `border-t` |
| Border radius | controls `rounded-lg`; buttons `rounded-full` via `buttonClass` |
| Text — primary | section heading `font-display text-lg font-semibold tracking-tight` (via `FormSection`) |
| Text — secondary | section description `text-sm text-muted-foreground`; legends `text-sm font-medium text-foreground/90` |
| Spacing | sections `mb-10`; fields `space-y-5`; paired fields `gap-5 sm:grid-cols-2` |
| Image target | poster `aspect-[4/3] max-h-[28rem]` |
| Hover state | via `buttonClass` |
| Shadow | primary `shadow-glow` |
| Accent usage | section bars, radios `accent-primary`, the one primary submit |

**Pattern notes:**
One component serves four cases: create and edit, page and dialog. `layout`
picks the chrome — `page` lays sections down the page with descriptions,
`dialog` renders a scrolling body plus a pinned footer for the dialog shell to
host. The values, the payload and the Server Actions are identical either way;
a second form would be a second thing to keep in step with `eventDraftSchema`.

Field values live in `event-form-values.ts`, shared by both layouts. The
dialog shows the essential set and the page shows everything (slug, tags,
price, external link) — same shape, fewer fields.

The Tickets section is a checkbox that reveals two fields, indented behind a
`border-l border-border pl-5` rule: the button text (placeholder `Get
Tickets`) and the purchase URL. Unticking clears both columns on submit, so a
disabled button never leaves a stale URL in the row. The stored label is what
the public event page renders, falling back to "Get tickets".

Inapplicable fields are absent, not disabled: `form.Subscribe` on `eventType`
hides the venue block (venue, address, city / country, map link) for an
online event and the join link for an in-person one, and on `isFree` hides price details. Those two conditionals are load
bearing — publish-readiness requires a join link for an online event and a
price or ticket link for a paid one, so hiding the field would make the event
unpublishable with no way to fix it.

Repeated text inputs come from a local `textField({ ... })` **function call**,
never a `<TextField />` element. A component declared inside another component
is a new type on every render, so React remounts the input and the field loses
focus after every keystroke.

Country is a free-text input with the shared `CountryOptions` datalist
(`components/forms/country-options.tsx`, one unique `id` per form). It is
typed by hand; `optionalCountrySchema` (`lib/countries.ts`) resolves the name
— or a code someone already knows — to the ISO code the column stores, and
an unrecognised value is a field error rather than a silently bad row. The
field shows the name, never the code. The profile form's Country field uses
the same pair (2026-10-03; it was a two-letter code input before).
Chrome and Safari draw a dropdown arrow on any `input[list]`, which made the
field read as a select; `globals.css` hides it
(`::-webkit-calendar-picker-indicator`, `::-webkit-list-button`), and the
suggestions still appear as you type.

The time zone control appears only in the page layout. The dialog reads its
times in the browser's own zone, which is right for a publisher creating an
event in front of them — the value is still submitted, just not asked for.

Dates are held as `datetime-local` readings plus a separate zone and resolved
at submit through `lib/datetime`. Never compare a wall-clock string as if it
were an instant.

Server field errors are the only validation today (no `validators.onChange`,
unlike the other forms — `build-plan.md` M6). Hidden fields never block Save:
`toPayload` sends inapplicable fields empty, and any field error whose field
is not on screen (`renderedFields`) becomes the form-level message, with
"Open the full editor to fix it." in the dialog.

### TagInput

File: app/dashboard/events/event-form.tsx (Tags section, page layout only)
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | input via `fieldControlClass`; chips `bg-white/[0.04]` |
| Border | chips `border border-border` |
| Border radius | chips and remove button `rounded-full`; input `rounded-lg` |
| Text — primary | chip label `text-xs font-medium text-foreground/90` |
| Text — secondary | remove icon `text-muted-foreground` |
| Spacing | input-to-chips `space-y-3`; chip row `gap-2`; chip `py-1 pr-2 pl-3` |
| Hover state | remove `hover:bg-destructive/15 hover:text-destructive` |
| Shadow | none |
| Accent usage | none — tags are metadata, not a call to action |

**Pattern notes:**
The chip is the same rounded-full bordered pill the public event page uses
to display tags (`bg-white/[0.03] px-3 py-1 text-xs`), so entry and display
read as one thing. Tags keep their typed case.

Enter, a comma, or blurring the field commits a tag; Backspace on an empty
input removes the last one. The input disables itself at the limit rather than
silently dropping what is typed. Each chip's remove button carries an
`sr-only` label naming the tag it removes.

### EventCard

File: components/events/event-card.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `surface`; location box `bg-white/[0.02]` |
| Border | `surface` hairline; location box `border border-border` |
| Border radius | `rounded-2xl`; poster and location box `rounded-xl`; ticket button `rounded-full` |
| Text — primary | title `font-display text-2xl font-semibold leading-tight tracking-tight md:text-[1.75rem]`; day `font-display text-4xl font-semibold md:text-5xl` |
| Text — secondary | month/year and time `font-mono text-xs uppercase tracking-widest text-muted-foreground`; location `text-sm` |
| Spacing | card `p-5 sm:p-6`, `gap-6 md:gap-8`; blocks `mb-5`; location box `p-3.5` |
| Hover state | `hover:-translate-y-0.5 hover:border-white/15 hover:shadow-lift`, title `group-hover:text-primary`, poster `group-hover:scale-105` |
| Shadow | `shadow-card`, `shadow-lift` on hover |
| Accent usage | category kicker (`text-xs font-medium text-primary`), pin, map link, ticket button |

**Pattern notes:**
Carries everything needed to decide without opening the event: category, day
and month, poster, title, summary, location, description and the way in.

**The card is not wrapped in an anchor.** The ticket and map links inside it
would be nested anchors — invalid markup that browsers resolve by breaking
one of them. The title's `<Link>` stretches over the card with
`after:absolute after:inset-0`, and the inner links sit above it on
`relative z-10`. Any future card with a control inside it does the same.

"View on map" goes to the publisher's pasted map link when there is one,
else an OpenStreetMap search of the address (`mapSearchUrl`, `lib/maps.ts`).

The date rail is a horizontal strip on mobile and a column from `md`, so the
poster sits beside the date on a phone rather than pushing the title down.

The description is `line-clamp-4`: a listing where one event runs three
screens tall has stopped being a listing. The event page has the whole text.

The ticket button is `buttonClass({ className: "relative z-10 w-full sm:w-auto" })`:
it spans the content column below `sm` and sizes to its label above. It uses `event.ticket_cta_label`, falling back to "Get
tickets", and is hidden entirely for a cancelled event — sending someone to
buy a ticket for an event that is off is worse than showing nothing.

### EventListRow (dashboard events list)

File: app/dashboard/events/event-list-row.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | list in `surface rounded-2xl`; header `bg-white/[0.02]`; row `hover:bg-white/[0.025]`; poster `bg-secondary` |
| Border | rows `border-t border-border first:border-t-0` |
| Border radius | container `rounded-2xl`; poster `rounded-xl ring-1 ring-border` |
| Text — primary | title `font-display text-base font-semibold leading-snug tracking-tight`; facts `font-mono text-xs leading-relaxed` |
| Text — secondary | category `text-xs font-medium text-primary`; mobile fact labels and column header `text-xs font-medium text-muted-foreground` |
| Spacing | row `px-5 py-5`, stacked `gap-4`, grid `lg:gap-6` |
| Hover state | row `hover:bg-white/[0.025]` |
| Shadow | `shadow-card` on the container |
| Accent usage | the category label |

**Pattern notes:**
Replaced the three-column table on 2026-10-03. Each row is an `<li>`
showing, in order: poster (the event's image, first; an `ImageIcon`
placeholder when there is none), title and category, then When ("Starts"
date · time, "Ends" time, or full date when it ends on another day, all in
the event's own timezone), then Location (venue, address, "city, country
name", and "Online"/"Hybrid" where it applies), then `EventRowActions`.

`EVENT_LIST_COLUMNS` is the one `lg` grid definition
(`minmax(0,1.6fr) minmax(0,1fr) minmax(0,1.3fr) auto`), used by both the rows
and the `aria-hidden` column header, so they cannot drift apart. Below `lg`
the header is hidden and each row stacks as a card, with a small label
("When", "Location") over each fact instead, and the actions sit under a
`border-t border-border pt-4` divider. Nothing is hidden on mobile. The events page is `max-w-6xl`
to give the four columns room.

### Switch

File: components/ui/switch.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | track on `bg-primary`, off `bg-white/[0.06]` (`group-hover:bg-white/[0.1]`); knob on `bg-primary-foreground`, off `bg-foreground/80` |
| Border | track `ring-1` — `ring-primary/50` on, `ring-border` off |
| Border radius | `rounded-full` on both track and knob |
| Text — secondary | state label `text-xs font-medium text-muted-foreground` |
| Spacing | track `h-6 w-11`, knob `size-5`, label gap `gap-3` |
| Hover state | label `group-hover:text-foreground` |
| Shadow | on `shadow-glow`; knob `shadow-sm` |
| Accent usage | the track when on |

**Pattern notes:**
A real `<button role="switch">` with `aria-checked`, never a styled checkbox
or a div. The role is what makes a screen reader say "switch, on", and the
button gives keyboard reach plus Space and Enter for free.

**The button wraps the state label as well as the track.** The text beside a
toggle is the obvious thing to aim at — leaving it outside the control gives
a dead zone that shows an arrow and does nothing on click. Track and label
are one target, and the label brightens on `group-hover` so the whole control
reacts together.

The state is always spelled out in text beside the track (ui-rules.md §16):
lime-or-not is invisible in greyscale and to a colour-blind viewer. The label
carries the real state where there is one — an events row shows "Published",
"Cancelled" or "Draft", not just on and off.

### EventRowActions

File: app/dashboard/events/event-row-actions.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | transparent; hover `hover:bg-white/[0.08]`, destructive `hover:bg-destructive/15` |
| Border | none at rest; confirm buttons `border border-border` / `border-destructive/40` |
| Border radius | `rounded-full` |
| Text — primary | icons only, `size-4` |
| Text — secondary | confirm prompt `text-xs font-medium text-muted-foreground` |
| Spacing | buttons `size-8`, row `gap-1`; confirm row `gap-2`, buttons `px-3 py-1 text-xs` |
| Hover state | `hover:text-foreground`; destructive `hover:text-destructive` |
| Shadow | none |
| Accent usage | none — a row of actions is not a call to action |

**Pattern notes:**
Four controls per row: a `Switch` for publish/unpublish with the status
spelled out beside it, then copy-link, edit and delete icons. Copy link
(`Link2`, a `Check` in `text-primary` for two seconds after copying, with an
`aria-live` announcement) writes the event's absolute public URL to the
clipboard. It is disabled with an explanatory `title` while the event is a
draft or archived, since that link is a 404 for anyone else; a clipboard
failure shows the URL in the row's error line so it can be copied by hand. Only the toggle is inline — cancel and postpone change
what a ticket holder sees, so they stay on the edit page rather than sitting
one stray click away in a list.

Edit opens the same dialog as creating, through `useEventDialog().openEdit`,
rather than navigating away — the list is where the publisher already is. The
dialog footer keeps a "Full editor" link for the fields it does not show.

Delete confirms in place: the icons are replaced by "Delete? Yes / No" in the
same cell. No `confirm()`, no modal for a decision this small.

Every control carries an `sr-only` label naming the event. A column of
identical icons is unusable otherwise, and `title` alone is not announced
reliably.

The toggle acts only on draft, published and unpublished (archived) rows.
For cancelled and postponed rows it is shown on and disabled, with a `title`
pointing to the edit page — toggling would silently turn "cancelled" into
"published". The label beside it is always the real status.

Every result is visible: a refused change (for example publishing a draft
with no city) appears as a `role="alert"` line in `text-xs text-destructive`
right under the row's controls; delete shows "Deleting…" while pending and
the same error line on failure.

### EventLifecycle

File: app/dashboard/events/[id]/edit/event-lifecycle.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `surface` |
| Border | `surface` hairline |
| Border radius | `rounded-2xl`; buttons `rounded-full` |
| Text — primary | heading `font-display text-base font-semibold tracking-tight` |
| Text — secondary | explanation `text-sm text-muted-foreground` |
| Spacing | panel `p-5`, `space-y-4`; button row `gap-3` |
| Hover state | via `buttonClass` (`secondary`, `primary`, `destructive`, all `size: "sm"`) |
| Shadow | `shadow-card` |
| Accent usage | the one forward action (Publish / Back on) |

**Pattern notes:**
The same `surface` card as the dashboard `Panel`, used here for a set of
actions rather than content. The buttons are generated from `EVENT_TRANSITIONS`
(`features/events/contracts.ts`), the same table the events service
enforces, so the panel can only offer a change the server accepts. Labels
depend on where the event comes from (`published` reads "Publish", "Back on"
or "Publish again"). A failed transition shows its message in a `FormAlert` above the buttons.

Exactly one action per state is primary. Destructive actions are outlined in
`border-destructive/40` and never filled — a filled red button next to a
filled lime one reads as a pair of equals.

Delete is two-step in place: the button becomes "Delete permanently" beside
"Keep it", with an explanation of what delete costs over unpublish. No
`confirm()`, and no modal for a decision this small.

### WordmarkLink

File: components/layout/wordmark-link.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | none |
| Border | none |
| Border radius | n/a |
| Text — primary | `font-display text-2xl font-semibold leading-none tracking-[-0.03em]` (auth passes `text-3xl`); the mark is `Wordmark`, also used bare by the footer |
| Text — secondary | n/a |
| Spacing | tail `h-[0.82em] align-[-0.082em] ml-[0.03em]` |
| Hover state | tail `group-hover:-rotate-[10deg]`; idle loop `animate-dot-hop` + `animate-tail-wag` every 7s |
| Shadow | none |
| Accent usage | the tail (`text-primary`) |

**Pattern notes:**
The only way to render the logo as a link. The caller passes the destination:
`routes.home()` on public pages, `routes.dashboard.root()` in the dashboard.
On the page it already points at it renders a plain `<a>` so a click reloads.
The logo is the word itself: a lime full stop, then "eventai" in Bricolage
Grotesque (`tracking-[-0.03em]`), then `LogoMark`
(`components/layout/logo-mark.tsx`), the final "l" drawn as a lime stem that
sweeps into a tapered, upturned tail, sized to Bricolage's "l" (0.70em
ascender, 0.125em stem; `h-[0.78em] align-[-0.078em]`) (redesigned 2026-10-03 at the
developer's request; the fan mark is gone). The visible word is
`aria-hidden` and an `sr-only` "eventail" names the link. Pass
`className="flex"`, not `block`, when overriding display.

The favicon is the tail alone (`TAIL_PATH`, no full stop — the dot does not
read at icon size) in lime on a `#0a0a0f` tile:
`app/icon.svg` is the source; `app/favicon.ico` (16/32/48, PNG entries) and
`app/apple-icon.png` (180, full-bleed) are rasterised from it. Change the
path in both files together and regenerate the rasters.

### EmptyState

File: components/ui/empty-state.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `bg-white/[0.015]` plus a `bg-radial from-glow/10` wash at the top |
| Border | `border border-dashed border-white/15` |
| Border radius | `rounded-2xl`; icon tile `rounded-2xl` |
| Text — primary | `font-display text-xl font-semibold tracking-tight` |
| Text — secondary | `text-sm leading-relaxed text-muted-foreground`, `max-w-sm` |
| Spacing | `px-6 py-20`, icon tile `size-14 mb-5`, title `mb-2`, description `mb-6` |
| Hover state | action via `buttonClass` |
| Shadow | action `shadow-glow` |
| Accent usage | the icon (`text-primary`) and the single primary action |

**Pattern notes:**
Title, description and one action are all required (ui-rules §10). `action`
is a link; `actionSlot` takes a node for actions that open a dialog (the
events list passes a `NewEventTrigger`). The dashed border marks "something
goes here", shared only with the empty `ImageUploader`.

### EventStatusBadge

File: components/events/event-status-badge.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | tinted, from `EVENT_STATUS_META` (`bg-primary/10`, `bg-destructive/10`, `bg-warning/10`, `bg-white/[0.04]`) |
| Border | `border`, tone from `EVENT_STATUS_META` (`/30`) |
| Border radius | `rounded-full` |
| Text — primary | `text-xs font-medium`, with a `size-1.5 bg-current` dot |
| Text — secondary | n/a |
| Spacing | `px-2.5 py-0.5`, `gap-1.5` |
| Hover state | none |
| Shadow | none |
| Accent usage | published lime; cancelled destructive; postponed warning; draft and archived muted |

**Pattern notes:**
Text and colour together, always (ui-rules §16). Tones and labels come from
`EVENT_STATUS_META` in `lib/format.ts`; never restate them. Public surfaces
show the badge only for non-published statuses.

### Public event page

File: app/publisher/[username]/[slug]/page.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `PublicShell` soft wash; image frame `bg-secondary`; facts card `surface`; cancelled banner `bg-destructive/10` |
| Border | banner `border-b border-destructive/30`; image frame `border border-border` |
| Border radius | image frame, facts card, organiser chip `rounded-2xl`; info icons `rounded-xl`; action `rounded-full` |
| Text — primary | title `font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl`; info values `text-sm font-medium` |
| Text — secondary | info labels `text-xs text-muted-foreground`; section headings `font-display text-lg/xl font-semibold` |
| Spacing | article `max-w-5xl gap-10 md:gap-12 px-6 py-12 md:py-16`; facts card `p-6 space-y-5` |
| Hover state | organiser chip `hover:border-white/15`; action via `buttonClass` |
| Shadow | image `shadow-lift`; cards `shadow-card`; action `shadow-glow` |
| Accent usage | category pill, info icon tiles (`bg-primary/10 text-primary`), "View on map", the full-width primary action |

**Pattern notes:**
Content in two columns, facts in a right-hand card: date, time with the IANA
zone beside it, and location, then one full-width lime action — the ticket
button (publisher's label, default "Get tickets") or, with no ticket URL,
"Join online". A cancelled event gets a `role="alert"` banner under the site
header and no action.

The event image heads the left content column as a framed poster
(`aspect-[4/3] w-full max-w-md rounded-2xl border bg-secondary shadow-lift`,
`object-contain`, `priority`): the whole image shows as uploaded, never
cropped or zoomed, with the frame's ground around it. Larger than the
listing's `md:w-40` thumbnail, never a full-width banner (removed 2026-10-03
— a strip crop lost most of the poster).

From `md` the facts card and the action are `md:sticky md:top-24
md:self-start`, so date, time, location and the ticket button stay in view
while the description scrolls; `top-24` clears the floating site header. It is also the Open Graph and JSON-LD image. Price is not shown on
the page (removed 2026-10-03 at the developer's request); the event form
still records it. JSON-LD is rendered inline with `<` escaped.

The location row shows whatever exists of venue, address and "city, country
name" for any non-online event, plus "Also online" for hybrid; only an
online event shows the event type instead. Under it, "View on map"
(`text-xs font-medium text-primary`, `ArrowUpRight size-3`,
`hover:opacity-80`, new tab) — the same treatment and the same
`mapSearchUrl` as the card's. JSON-LD location follows the same rule
(`Place` with `hasMap`, `VirtualLocation`, or both). The page renders `TrackView`, and
the ticket button is a `TicketLink`.


### StatusMessage

File: components/ui/status-message.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | none (page ground; public pages sit in `PublicShell`) |
| Border | none |
| Border radius | actions `rounded-full` |
| Text — primary | title `font-display font-semibold tracking-tight`, `text-4xl md:text-6xl` (page) / `text-3xl md:text-4xl` (panel) |
| Text — secondary | kicker is an `Eyebrow`; description `leading-relaxed text-muted-foreground max-w-md` |
| Spacing | `px-6`, `py-24 md:py-32` (page) / `py-20` (panel); kicker `mb-5`, title `mb-4`, description `mb-8`; actions `gap-3` |
| Hover state | via `buttonClass` |
| Shadow | primary `shadow-glow` |
| Accent usage | the one primary action |

**Pattern notes:**
The whole-screen state for not found and errors. `size="page"` fills a public
page between `SiteHeader` and `SiteFooter`; `size="panel"` sits inside the
dashboard shell, which stays so the publisher can navigate away. Kicker is the
status in one word ("404", "Error"), the title says what happened, the
description says what to do, and there is always a way out — primary first
(`statusPrimaryActionClass` = `buttonClass()`), then
`statusSecondaryActionClass` = `buttonClass({ variant: "secondary" })`. Error boundaries never print `error.message`;
they log it with its `digest`. Presentational only, so Server and Client
Components share it.

### Skeleton / LoadingRegion

File: components/ui/skeleton.tsx
Last updated: 2026-10-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background | `bg-white/[0.05]` with `animate-pulse` |
| Border | none; panel-shaped blocks add `border border-border` |
| Border radius | `rounded-xl`; panel-shaped blocks `rounded-2xl` |
| Text — primary | n/a |
| Text — secondary | `sr-only` label in `LoadingRegion` |
| Spacing | set by the caller to match the real layout |
| Hover state | none |
| Shadow | none |
| Accent usage | none |

**Pattern notes:**
Blocks are sized to the content that replaces them (header block: `h-3 w-24`
kicker, `h-10 md:h-12` title, `h-4` line; panels at their real heights), so
nothing jumps on arrival. Wrap the layout in `LoadingRegion` with a label
("Loading your events") — it is `role="status"` so screen readers hear one
announcement while the blocks themselves are `aria-hidden`. The pulse stops
under reduced motion. Do not add `loading.tsx` to public pages that can call
`notFound()`: streaming commits a 200 before the 404 can be set.

### TrackView / TicketLink

File: components/analytics/track-view.tsx, components/analytics/ticket-link.tsx
Last updated: 2026-09-30

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | n/a — `TrackView` renders nothing; `TicketLink` takes the caller's classes |
| Border           | n/a                                                 |
| Border radius    | n/a                                                 |
| Text — primary   | n/a                                                 |
| Text — secondary | n/a                                                 |
| Spacing          | n/a                                                 |
| Hover state      | the caller's                                        |
| Shadow           | none                                                |
| Accent usage     | none                                                |

**Pattern notes:**
Put `<TrackView username eventId? />` once on any public page that should
count as a visit; leave it out of previews rather than passing a flag.
Every ticket button is a `TicketLink` — an ordinary `target="_blank"` anchor
to the provider that also reports the click — never a bare `<a>`. Both go
through `reportHit`, which dedupes per session and never surfaces an error to
a visitor.

---

# Component Rules

1. Reuse existing components.
2. Extend existing components before creating duplicates.
3. Generic components belong in shared UI.
4. Domain-specific components belong in their feature.
5. New reusable components must be added to this registry.
6. Avoid one-off variants.
7. Components must remain accessible.
8. Components must support responsive behavior.
