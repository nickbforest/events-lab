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
* StatsCard
* DataTable
* EmptyState
* LoadingState
* ErrorState
* ConfirmationDialog

---

# Forms

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
