# events-lab — UI Registry

This document contains the approved reusable UI components and patterns.

Before creating a new reusable component, check this registry.

Avoid duplicate components.

---

# Base UI

* Button
* IconButton
* Link
* Input
* Textarea
* Select
* Checkbox
* Radio
* Switch
* Label
* FormField
* FormMessage
* Badge
* Avatar
* Separator
* Tooltip
* Dialog
* Drawer
* DropdownMenu
* Popover
* Tabs

---

# Navigation

* Header
* DesktopNavigation
* MobileNavigation
* UserMenu
* Breadcrumbs
* Tabs
* Pagination

---

# Event Components

* NewEventDialog
* EventCard
* EventGrid
* EventList
* EventHero
* EventDate
* EventTime
* EventLocation
* EventStatusBadge
* EventCategoryBadge
* EventOrganizer
* EventGallery
* EventActions
* EventShare
* EventFilters
* EventSearch
* RelatedEvents
* EventMap
* EventMapMarker

---

# Organization Components

* OrganizationCard
* OrganizationHeader
* OrganizationLogo
* OrganizationTypeBadge
* OrganizationEvents
* OrganizationMembers
* OrganizationRoleBadge

---

# Dashboard

* DashboardShell
* DashboardHeader
* Panel
* RangeTabs
* TrendChart
* StatsCard
* StatsCardRow
* DataTable
* EmptyState
* LoadingState
* ErrorState
* ConfirmationDialog

---

# Forms

* Field
* FormSection
* EventForm
* OrganizationForm
* ProfileForm
* SearchForm
* LocationPicker
* ImageUploader
* GalleryUploader
* DateTimePicker
* DateRangePicker

---

# Discovery

* SearchBar
* FilterBar
* FilterDrawer
* CategoryList
* TagList
* LocationFilter
* SortControl
* EventMap
* EventMapMarker

---

# Feedback

* Toast
* Alert
* InlineError
* Skeleton
* Spinner
* EmptyState
* SuccessState

---

# Admin / Moderation

* ModerationQueue
* ModerationCard
* ReportDialog
* AdminTable
* RoleBadge
* StatusBadge

---

# Captured Patterns

Entries written by `/imprint` from shipped code. These are the authoritative
classes — match them when building anything of the same type.

### SiteHeader

File: components/layout/site-header.tsx
Last updated: 2026-09-03

| Property         | Class                                            |
| ---------------- | ------------------------------------------------ |
| Background       | `bg-background/80` + `backdrop-blur-md`           |
| Border           | `border-b border-border`                          |
| Border radius    | `rounded-md` (nav links and buttons)              |
| Text — primary   | `text-sm font-medium` on default foreground       |
| Text — secondary | `text-sm font-medium text-muted-foreground`       |
| Spacing          | `h-16 px-6`, `gap-1 sm:gap-3`, links `px-3 py-2`  |
| Hover state      | ghost `hover:bg-white/5 hover:text-foreground`; solid `hover:opacity-90` |
| Shadow           | none                                              |
| Accent usage     | `text-primary` on the wordmark hyphen only        |

**Pattern notes:**
The public header carries exactly two actions — a ghost `Log in` and a solid
`Get started` (`bg-foreground text-background`), both to `/auth`. It holds no
app navigation: Discover is reached from the landing page, and the dashboard
is reached from its own sidebar once signed in. Do not add nav links here.

### DashboardShell (sidebar)

File: components/layout/dashboard-shell.tsx
Last updated: 2026-09-03

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-card/40`                                        |
| Border           | `border-b border-border` mobile, `md:border-r`      |
| Border radius    | `rounded-md` on nav items                           |
| Text — primary   | active `text-foreground`, `text-sm font-medium`     |
| Text — secondary | idle `text-muted-foreground`, `text-sm font-medium` |
| Spacing          | shell `p-6`, items `px-3 py-2`, nav `gap-1`, footer `border-t pt-6` |
| Hover state      | `hover:bg-white/5 hover:text-foreground`            |
| Shadow           | none                                                |
| Accent usage     | wordmark hyphen; preview link `hover:text-primary`  |

**Pattern notes:**
Nav items pair a `size-4` lucide icon with a `gap-3` label; the active item is
marked with `aria-current="page"` and `bg-white/5`. Order is fixed: Overview,
Events, Profile in the main nav, then a `border-t` footer holding the public
preview link (`font-mono text-xs`, `ExternalLink` at `size-3`) and Sign out.
Sign out is always last and uses the same idle-nav-item treatment rather than
a destructive color — it is a navigation action, not a dangerous one.

### DashboardHeader

File: components/layout/dashboard-header.tsx
Last updated: 2026-09-09

| Property         | Class                                                    |
| ---------------- | -------------------------------------------------------- |
| Background       | none (sits on the page ground)                            |
| Border           | none                                                      |
| Border radius    | n/a                                                       |
| Text — primary   | `font-display text-3xl font-extrabold uppercase tracking-tighter md:text-4xl` |
| Text — secondary | kicker `font-mono text-xs uppercase tracking-widest text-primary`; description `font-mono text-sm text-muted-foreground` |
| Spacing          | `mb-10`, `gap-4`, kicker `mb-2`, description `mt-2`       |
| Hover state      | none                                                      |
| Shadow           | none                                                      |
| Accent usage     | the kicker, and only the kicker                           |

**Pattern notes:**
Every dashboard screen opens with this and nothing else — a lime mono kicker,
the uppercase display title, an optional mono context line, then the screen's
actions pushed right on `items-end`. Do not hand-roll a title block in a page;
add a prop here instead. Actions are passed as nodes so a screen can carry a
ghost + solid pair (Events) or a segmented control (Overview).

### Panel

File: components/dashboard/panel.tsx
Last updated: 2026-09-09

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-card/30`                                        |
| Border           | `border border-border`, header split `border-b`     |
| Border radius    | `rounded-lg`                                        |
| Text — primary   | `font-display text-sm font-extrabold uppercase tracking-tight` |
| Text — secondary | `font-mono text-xs text-muted-foreground`           |
| Spacing          | header `px-6 py-5`, body `p-6`, rows `py-3`         |
| Hover state      | action link `hover:text-primary`                    |
| Shadow           | none                                                |
| Accent usage     | the header action link on hover only                |

**Pattern notes:**
The card used for every titled block on the dashboard — chart, upcoming
events, most viewed. Header is always hairline-separated from the body; the
optional action is a mono uppercase link on the right (`ALL`), never a button.
Lists inside use `divide-y divide-border` with `first:pt-0 last:pb-0` so the
row rhythm meets the padding cleanly. Use `PanelEmpty` for the nothing-yet
line rather than the full `EmptyState` — inside a panel the surrounding header
already says what is empty.

### StatsCard / StatsCardRow

File: components/dashboard/stats-card.tsx
Last updated: 2026-09-09

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-card/30` on the row, tiles are transparent      |
| Border           | row `border border-border`, tiles `divide-border`   |
| Border radius    | `rounded-lg` on the row only                        |
| Text — primary   | `font-display text-4xl font-extrabold tracking-tighter tabular-nums md:text-5xl` |
| Text — secondary | `font-mono text-xs uppercase tracking-widest text-muted-foreground` |
| Spacing          | tile `p-6`, label-to-value `mb-4`                   |
| Hover state      | none — a stat tile is not interactive               |
| Shadow           | none                                                |
| Accent usage     | `accent` prop puts one value in `text-primary`      |

**Pattern notes:**
Tiles never float individually: they go inside `StatsCardRow`, which draws one
border and separates them with hairlines (`divide-y` stacking to `sm:divide-x`).
The optional `size-4` lucide icon sits top-right, muted and `aria-hidden` — it
labels nothing the text does not already say. At most one tile per row carries
`accent`; two competing lime numbers read as a chart, not a hierarchy. Values
are always `tabular-nums` so they do not jitter between range switches.

### RangeTabs

File: components/dashboard/range-tabs.tsx
Last updated: 2026-09-09

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | active `bg-primary`, idle transparent               |
| Border           | `border border-border`, segments `border-l`         |
| Border radius    | `rounded-md` on the group, segments square          |
| Text — primary   | active `text-primary-foreground`                    |
| Text — secondary | idle `text-muted-foreground`                        |
| Spacing          | segments `px-4 py-2.5`                              |
| Hover state      | `hover:bg-white/5 hover:text-foreground` (idle only)|
| Shadow           | none                                                |
| Accent usage     | the selected segment's lime fill                    |

**Pattern notes:**
A segmented control built from `Link`s, not buttons — the selection drives a
server query, so it belongs in the URL and the page stays a Server Component.
Selection is marked with `aria-current="page"`, and the group is a `<nav>` with
an `aria-label`. All segments are `font-mono text-xs uppercase tracking-widest`.
Reuse this shape for any other server-driven segmented filter.

### TrendChart

File: components/dashboard/trend-chart.tsx
Last updated: 2026-09-11

| Property         | Class / value                                      |
| ---------------- | -------------------------------------------------- |
| Background       | none — it sits inside a `Panel`                     |
| Border           | chart grid uses `var(--border)`; table wrapper `border border-border` |
| Border radius    | table wrapper `rounded-md`                          |
| Text — primary   | table values `font-mono text-xs tabular-nums`       |
| Text — secondary | axes and legend `font-mono text-[11px]` / `text-xs uppercase tracking-widest text-muted-foreground` |
| Spacing          | legend `mt-4 gap-x-6`, table view `mt-4`            |
| Hover state      | TanStack Charts grouped x-focus, crosshair, focus markers, and tooltip |
| Shadow           | none in application-owned markup                    |
| Accent usage     | series only: visits `#7E9F30`, clicks `#3B82F6`     |

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
Last updated: 2026-09-14

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | control `bg-card`                                   |
| Border           | control `border border-border`; section heading `border-b border-border` |
| Border radius    | `rounded-md`                                        |
| Text — primary   | control `text-sm`                                   |
| Text — secondary | label and hint `font-mono text-xs uppercase tracking-widest text-muted-foreground` (hint not uppercased) |
| Text — error     | `mt-1.5 font-mono text-xs leading-relaxed text-destructive` |
| Spacing          | control `px-4 py-2.5`, label `mb-2`, hint/error `mt-1.5`, fields `space-y-5`, section `mb-10` |
| Hover state      | none — focus is the state that matters              |
| Shadow           | none                                                |
| Accent usage     | section heading `text-primary`; focus `focus:border-primary` |

**Pattern notes:**
`fieldControlClass` is the single source for input, textarea and select
styling — import it rather than restating the classes, so the three never
drift apart. Every control has a real `<label htmlFor>`.

A field carries at most one message: `error` replaces `hint` rather than
stacking under it, because once a control is invalid the correction is the only
guidance that matters. Wire the control with `fieldDescribedBy({ id, hasHint,
hasError })` — it returns `${id}-error` or `${id}-hint` so `aria-describedby`
always points at the message actually on screen — and set `aria-invalid` when
an error is present. Never surface an error through colour alone.

Sections are grouped by `FormSection`, whose lime mono heading over a hairline
rule is the only section marker used in dashboard forms. Two-column field grids
are `sm:grid-cols-2` with `gap-5`.

### AuthCard

File: components/auth/auth-card.tsx
Last updated: 2026-09-14

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-card/40`                                        |
| Border           | `border border-border`                              |
| Border radius    | `rounded-lg`                                        |
| Text — primary   | heading `font-display text-2xl font-extrabold uppercase tracking-tight` |
| Text — secondary | subheading `text-sm text-muted-foreground`; body `font-mono text-xs leading-relaxed text-muted-foreground` |
| Spacing          | card `p-8`, wordmark `mb-10`, heading `mb-1`, subheading `mb-8`, fields `space-y-5`, footer `mt-6` |
| Hover state      | submit `hover:brightness-110`; links `hover:underline` |
| Shadow           | none                                                |
| Accent usage     | wordmark hyphen, footer link, and the submit fill   |

**Pattern notes:**
The shell for every signed-out screen — signup, login, forgot password, update
password, check email, link expired. Width is fixed at `max-w-sm` and the page
centres it with `flex flex-1 flex-col items-center justify-center px-6 py-16`.
Do not hand-roll this frame in a new auth route; pass `heading`, `subheading`
and an optional `footer` instead.

`authSubmitClass` is the single source for the primary auth button and carries
`disabled:cursor-not-allowed disabled:opacity-60`, since every auth form
disables its button while submitting and swaps the label to a present
participle ("Logging in…"). Secondary actions inside the card use the outlined
treatment `border border-border … hover:bg-white/5` rather than a second fill —
one lime button per card.

Form-level failures render through `FormAlert` (`role="alert"`, `text-sm
text-destructive`) directly above the submit button; field-level failures belong
to `Field`. Advisory confirmations — username availability, "link resent" — use
an `aria-live="polite"` paragraph in `font-mono text-xs text-primary`, never an
alert, because they are not errors.

### ImageUploader

File: components/forms/image-uploader.tsx
Last updated: 2026-09-09

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | transparent; `hover:bg-white/[0.02]`                |
| Border           | `border border-dashed border-border`                |
| Border radius    | `rounded-md`                                        |
| Text — primary   | `font-mono text-xs uppercase tracking-widest text-muted-foreground` |
| Text — secondary | constraint line `font-mono text-xs text-muted-foreground` |
| Spacing          | `px-6 py-12`, `gap-3`                               |
| Hover state      | `hover:border-primary/50 hover:bg-white/[0.02]`     |
| Shadow           | none                                                |
| Accent usage     | `focus-within:border-primary`                       |

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


### NewEventDialog

File: components/events/new-event-dialog.tsx
Last updated: 2026-09-09

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-card`; backdrop `backdrop:bg-black/70 backdrop:backdrop-blur-sm` |
| Border           | `border border-border`; header `border-b`, footer `border-t` |
| Border radius    | `rounded-lg`                                        |
| Text — primary   | header `font-display text-sm font-extrabold uppercase tracking-tight` |
| Text — secondary | footer note `font-mono text-xs text-muted-foreground` |
| Spacing          | header/footer `px-6 py-4`, body `px-6 pt-6`         |
| Hover state      | close button `hover:bg-white/5 hover:text-foreground` |
| Shadow           | none — the backdrop does the separating             |
| Accent usage     | the submit button only                              |

**Pattern notes:**
Built on the native `<dialog>` with `showModal()`, never a hand-rolled overlay
— focus trapping, Escape, `inert` background and top-layer stacking all come
from the platform, and those are exactly what custom modals get wrong. Sizing
is `max-h-[90vh] w-[min(46rem,calc(100vw-2rem))]`, and the panel is a flex
column: fixed header, `overflow-y-auto` body, footer pinned with a solid
`bg-card` so content scrolls under it rather than through it. Backdrop clicks
are detected by comparing `event.target` to the dialog element itself.

Multiple triggers share one dialog through `NewEventProvider` — never mount a
second copy per button, or the field ids duplicate. `NewEventTrigger` takes
its classes from the caller so a trigger can be a primary button in a header
and the CTA inside an `EmptyState` (via its `actionSlot`) without either one
restating the dialog. Form content reuses `FormSection`, `Field` and
`ImageUploader` exactly as a full-page form would.

### DiscoverFilters

File: components/events/discover-filters.tsx
Last updated: 2026-09-11

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | search control `bg-card`; active chips transparent |
| Border           | search `border border-border`; chips `border`, active `border-primary` |
| Border radius    | search and button `rounded-md`; chips `rounded`     |
| Text — primary   | search `text-sm`; submit `text-sm font-medium`       |
| Text — secondary | labels and chips `font-mono text-xs uppercase text-muted-foreground` |
| Spacing          | search `gap-2`; filter rows `mt-8` / `mt-3`; chips `px-3 py-1` |
| Hover state      | idle chip `hover:text-foreground`; submit `hover:brightness-110` |
| Shadow           | none                                                |
| Accent usage     | active chip border/text/checkmark and submit fill   |

**Pattern notes:**
The search form sits in a semantic `<search>` region. Date and category chips
are grouped in labelled `<fieldset>` elements. Each chip is a button with
`aria-pressed`, and the selected state adds a visible checkmark so colour is
never the only signal. Filter state belongs in the URL and navigation uses
`router.replace` without scrolling.


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
