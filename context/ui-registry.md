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
Events, Profile, Settings in the main nav (Settings added 2026-09-21), then a
`border-t` footer holding the public preview link (`font-mono text-xs`,
`ExternalLink` at `size-3`) and Sign out.
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
Last updated: 2026-09-26

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
are `sm:grid-cols-2` with `gap-5`. Its optional `description` (added
2026-09-26) sits under the rule as `text-sm text-muted-foreground` — use it
when the heading alone does not say what the section is for, and keep it to
one line.

`formSubmitClass` (same file, added 2026-09-21) is the single source for a
dashboard form's lime submit button: `rounded-md bg-primary px-6 py-3 text-sm
font-medium text-primary-foreground hover:brightness-110
disabled:cursor-not-allowed disabled:opacity-60`. It matches `authSubmitClass`
except for `w-full`. The button swaps its label to a present participle while
submitting ("Saving…").

A value the owner can see but not change (username, current email) is a real
`<input readOnly disabled>` with `fieldControlClass` plus `cursor-not-allowed
opacity-60`, and its hint says why it is fixed. Never render it as plain text:
it has to read as a field.

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

A notice carried in from another screen (login's `?notice=password-changed`)
is a `role="status"` paragraph in `mb-5 font-mono text-xs leading-relaxed
text-primary` above the form. Only known notice values render, so the URL can
never inject text.

### ImageUploader

File: components/forms/image-uploader.tsx
Last updated: 2026-09-21

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

With `previewUrl` the frame fills with the image (`object-cover`) under a
`bg-black/40` scrim so the mono label stays legible, and the label reads "Click
to replace". While `busy`, the image dims to `opacity-50`, the label reads
"Uploading…", the input is disabled and the frame carries `aria-busy`. An
`error` replaces `description` below the frame in `text-destructive`, exactly
as `Field` swaps hint for error. It is a client component: it owns the change
handler, and it resets the input so choosing the same file twice still fires.

Profile media uses it through `ProfileMediaField`, which uploads on selection
rather than on the form's Save: an image is its own write, so a failed upload
never discards unsaved text. Avatar frames are `aspect-square px-3 py-6` in a
`10rem` column; covers are `aspect-[3/1] min-h-40`.


### Avatar

File: components/ui/avatar.tsx
Last updated: 2026-09-21

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-secondary` (shows behind the letter fallback)   |
| Border           | none                                                |
| Border radius    | `rounded-lg`, never a circle                        |
| Text — primary   | `font-display`; weight and size set by the caller   |
| Text — secondary | n/a                                                 |
| Spacing          | none; `grid place-items-center` centres the letter  |
| Hover state      | none; hover belongs to the surrounding link         |
| Shadow           | none                                                |
| Accent usage     | none                                                |

**Pattern notes:**
A publisher's image, or the first letter of their name when there is none.
Every existing letter block was replaced by this, so no page hand-rolls one.
The caller sets size and letter weight together: `size-20 text-3xl
font-extrabold` in the publisher header, `size-10 font-bold` beside a byline.
`sizes` must match the rendered width so next/image does not fetch a larger
file than it shows. It is `aria-hidden` because the name is always printed
beside it; if a use ever shows it alone, give it an accessible name first.

### Publisher page header

File: app/publishers/[username]/page.tsx
Last updated: 2026-09-21

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | cover banner `bg-secondary` behind the image        |
| Border           | cover `border-b border-border`; header `border-b`   |
| Border radius    | none on the cover; it runs full-bleed               |
| Text — primary   | `font-display text-4xl font-extrabold uppercase tracking-tighter md:text-5xl` |
| Text — secondary | handle `font-mono text-sm text-muted-foreground`; meta `font-mono text-xs uppercase` |
| Spacing          | header `px-6 py-16`, avatar-to-text `gap-6`         |
| Hover state      | meta links `hover:text-primary`                     |
| Shadow           | none                                                |
| Accent usage     | the publisher-type kicker above the name            |

**Pattern notes:**
The cover is an `aspect-[3/1] max-h-80 w-full` banner above the header, loaded
with `priority` because it is the first thing on the page. It renders only
when a cover exists; with none, the header starts the page unchanged, so a
publisher without images sees the page exactly as before. The avatar sits
beside the name, not overlapping the cover. Link previews use the cover, or
failing that the avatar, as their Open Graph image.

### Account forms (ProfileForm, EmailForm, PasswordForm)

Files: app/dashboard/profile/profile-form.tsx, app/dashboard/settings/*.tsx
Last updated: 2026-09-21

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | none; fields carry `bg-card` via `fieldControlClass` |
| Border           | profile footer `border-t border-border pt-6`        |
| Border radius    | inherited from `Field` and `formSubmitClass`        |
| Text — primary   | via `Field`                                         |
| Text — secondary | footer note `font-mono text-xs text-muted-foreground` |
| Spacing          | fields `space-y-5`; footer `flex justify-between gap-4` |
| Hover state      | submit `hover:brightness-110`                       |
| Shadow           | none                                                |
| Accent usage     | `formSubmitClass`, and success lines in `text-primary` |

**Pattern notes:**
Each is a TanStack Form client component rendered by a thin Server Component
page that loads the data. The footer pairs a left-hand status line with the
right-hand submit button. Success is an `aria-live="polite"` line in
`font-mono text-xs text-primary` ("Profile saved."); a result that is not yet
final says so ("Confirmation pending for …"), never "changed". A form whose
success leaves the page (password change signs out) states that consequence in
the footer before submit instead.

Server field errors are held beside TanStack's own and cleared when that field
is edited, so a stale server message never outlives the input that caused it.

Settings stacks one `FormSection` per concern (Email, Password), each with its
own submit, so one failing never blocks the other. The profile form is a single
submission with a closing `border-t` footer. Password fields autocomplete as
`current-password` / `new-password` next to a hidden `username` input, so
password managers file the change under the right account.

### NewEventDialog

File: app/dashboard/events/event-create-dialog.tsx
Last updated: 2026-09-26

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-card`; backdrop `backdrop:bg-black/70 backdrop:backdrop-blur-sm` |
| Border           | `border border-border`; header `border-b`, footer `border-t` |
| Border radius    | `rounded-lg`                                        |
| Text — primary   | header `font-display text-sm font-extrabold uppercase tracking-tight` |
| Text — secondary | `text-muted-foreground`                             |
| Spacing          | header/footer `px-6 py-4`, body `px-6 pt-6`         |
| Hover state      | close button `hover:bg-white/5 hover:text-foreground` |
| Shadow           | none — the backdrop does the separating             |
| Accent usage     | the single primary submit in the footer             |

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

Multiple triggers share one dialog through `NewEventProvider` — never mount a
second copy per button, or every field id on the page duplicates.
`NewEventTrigger` takes its classes from the caller, so the same dialog opens
from a header button and from an `EmptyState` `actionSlot`.

### EventForm

File: app/dashboard/events/event-form.tsx
Last updated: 2026-09-26

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | inherits; controls `bg-card` via `fieldControlClass` |
| Border           | section rule `border-b border-border`; dialog footer `border-t` |
| Border radius    | controls and buttons `rounded-md`                   |
| Text — primary   | section heading `font-mono text-xs uppercase tracking-widest text-primary` |
| Text — secondary | section description `text-sm text-muted-foreground` |
| Spacing          | sections `mb-10`; fields `space-y-5`; paired fields `gap-5 sm:grid-cols-2` |
| Hover state      | submit `hover:brightness-110`; secondary `hover:bg-white/5` |
| Shadow           | none                                                |
| Accent usage     | section headings and the one primary submit         |

**Pattern notes:**
One component serves four cases: create and edit, page and dialog. `layout`
picks the chrome — `page` lays sections down the page with descriptions,
`dialog` renders a scrolling body plus a pinned footer for the dialog shell to
host. The values, the payload and the Server Actions are identical either way;
a second form would be a second thing to keep in step with `eventDraftSchema`.

Field values live in `event-form-values.ts`, shared by both layouts. The
dialog shows the essential set and the page shows everything (slug, tags,
ticket and external links) — same shape, fewer fields.

Inapplicable fields are absent, not disabled: `form.Subscribe` on `eventType`
hides the venue block for an online event and the join link for an in-person
one, and on `isFree` hides price details. Those two conditionals are load
bearing — publish-readiness requires a join link for an online event and a
price or ticket link for a paid one, so hiding the field would make the event
unpublishable with no way to fix it.

Repeated text inputs come from a local `textField({ ... })` **function call**,
never a `<TextField />` element. A component declared inside another component
is a new type on every render, so React remounts the input and the field loses
focus after every keystroke.

Country is a `<select>` of full names from `lib/countries.ts` that stores the
ISO alpha-2 code the column constrains. Nobody should have to type "GE".

Dates are held as `datetime-local` readings plus a separate zone and resolved
at submit through `lib/datetime`. Never compare a wall-clock string as if it
were an instant.

### TagInput

File: app/dashboard/events/event-form.tsx (Tags section, page layout only)
Last updated: 2026-09-26

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | input `bg-card` via `fieldControlClass`; chips transparent |
| Border           | chips `border border-border`                        |
| Border radius    | chips `rounded-full`; input `rounded-md`            |
| Text — primary   | chip label `font-mono text-xs uppercase`            |
| Text — secondary | chips `text-muted-foreground`                       |
| Spacing          | input-to-chips `space-y-3`; chip row `gap-2`; chip `px-3 py-1` |
| Hover state      | remove button `hover:text-destructive`              |
| Shadow           | none                                                |
| Accent usage     | none — tags are metadata, not a call to action      |

**Pattern notes:**
The chip shape is the same `rounded-full border border-border px-3 py-1
font-mono text-xs uppercase text-muted-foreground` the public event page uses
to display tags, so entry and display read as one thing.

Enter, a comma, or blurring the field commits a tag; Backspace on an empty
input removes the last one. The input disables itself at the limit rather than
silently dropping what is typed. Each chip's remove button carries an
`sr-only` label naming the tag it removes.

### EventLifecycle

File: app/dashboard/events/[id]/edit/event-lifecycle.tsx
Last updated: 2026-09-26

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-card/40`                                        |
| Border           | `border border-border`; destructive `border-destructive/40` |
| Border radius    | `rounded-lg`; buttons `rounded-md`                  |
| Text — primary   | heading `font-mono text-xs uppercase tracking-widest text-primary` |
| Text — secondary | explanation `text-sm text-muted-foreground`         |
| Spacing          | panel `p-5`, `space-y-4`; button row `gap-3`        |
| Hover state      | default `hover:bg-white/5`; destructive `hover:bg-destructive/10` |
| Shadow           | none                                                |
| Accent usage     | the one forward action (Publish / Back on)          |

**Pattern notes:**
The same `bg-card/40` bordered panel as the dashboard `Panel`, used here for a
set of actions rather than content. Available transitions come from a lookup
keyed by status, not a chain of conditions, so the UI can never offer a change
the service would refuse.

Exactly one action per state is primary. Destructive actions are outlined in
`border-destructive/40` and never filled — a filled red button next to a
filled lime one reads as a pair of equals.

Delete is two-step in place: the button becomes "Delete permanently" beside
"Keep it", with an explanation of what delete costs over unpublish. No
`confirm()`, and no modal for a decision this small.

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
