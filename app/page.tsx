import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarPlus,
  Check,
  Globe,
  Link2,
  Lock,
  MapPin,
  Send,
  Share2,
  Sparkles,
  Ticket,
  UserPlus,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { buttonClass } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/format";
import { routes } from "@/lib/routes";
import { AudienceWall } from "./audience-wall";

/* Illustrations on this page are decorative sample UI with made-up
   publishers and venues, hidden from assistive technology; the text beside
   each one says the same thing. */

const PREVIEW_EVENTS = [
  {
    day: "14",
    month: "Nov",
    title: "Late-night jazz session",
    place: "The Copper Finch · Brooklyn, NY",
    cta: "Get tickets",
  },
  {
    day: "22",
    month: "Nov",
    title: "Vinyl swap & listening bar",
    place: "Halcyon Loft · SoHo, NY",
    cta: "Free entry",
  },
  {
    day: "03",
    month: "Dec",
    title: "Winter quartet showcase",
    place: "Pier 74 Studio · Queens, NY",
    cta: "Get tickets",
  },
];

function HeroPreview() {
  return (
    <div aria-hidden className="relative mx-auto mt-16 max-w-3xl md:mt-20">
      {/* Halo behind the window. */}
      <div className="absolute -inset-x-6 -top-20 h-72 bg-radial from-glow/30 to-transparent to-70%" />

      <div className="surface relative overflow-hidden rounded-3xl p-2 shadow-lift">
        <div className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
          </div>
          <div className="mx-auto flex min-w-0 items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 font-mono text-[11px] text-muted-foreground">
            <Lock className="size-3 shrink-0" />
            <span className="truncate">eventail.space/publisher/nightowl</span>
          </div>
          <div className="hidden w-10 sm:block" />
        </div>

        <div className="rounded-[1.25rem] border border-border bg-background/80 p-5 text-left sm:p-7">
          <div className="mb-6 flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-glow to-glow-2 font-display text-xl font-semibold">
              N
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-tight">
                Night Owl Sessions
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                @nightowl · Organizer · New York
              </div>
            </div>
          </div>

          <ul className="space-y-2.5">
            {PREVIEW_EVENTS.map((event, index) => (
              <li
                key={event.title}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border border-border bg-white/[0.02] p-3 sm:p-3.5",
                  index > 1 && "hidden sm:flex",
                )}
              >
                <div className="grid w-12 shrink-0 place-items-center rounded-xl bg-white/[0.04] py-1.5 ring-1 ring-border">
                  <span className="font-display text-lg leading-none font-semibold">
                    {event.day}
                  </span>
                  <span className="mt-0.5 font-mono text-[10px] text-muted-foreground uppercase">
                    {event.month}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {event.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {event.place}
                  </div>
                </div>
                <span
                  className={cn(
                    "hidden shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium sm:inline-flex",
                    index === 0
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground",
                  )}
                >
                  {event.cta}
                  {index === 0 ? <ArrowUpRight className="size-3" /> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Floating chips */}
      <div className="animate-float glass absolute top-1/3 -left-40 hidden items-center gap-3 rounded-2xl px-4 py-3 shadow-lift xl:flex">
        <div className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
          <Ticket className="size-4" />
        </div>
        <div className="text-left">
          <div className="font-display text-lg leading-none font-semibold">
            +128
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            ticket clicks this week
          </div>
        </div>
      </div>

      <div className="animate-float-delayed glass absolute -right-36 bottom-12 hidden items-center gap-2.5 rounded-full py-2 pr-4 pl-2 shadow-lift xl:flex">
        <span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-4" />
        </span>
        <span className="text-sm font-medium">Link copied</span>
      </div>
    </div>
  );
}

interface Feature {
  Icon: typeof Globe;
  title: string;
  body: string;
  className?: string;
  /** The icon's hover motion — each feature moves in its own way. */
  iconMotion: string;
  visual?: ReactNode;
}

const FEATURES: Feature[] = [
  {
    Icon: Globe,
    iconMotion: "group-hover:animate-spin-slow",
    title: "Your own public page",
    body: "Every publisher gets a page of their own at eventail.space/publisher/yourname — a shareable home for your upcoming schedule.",
    className: "md:col-span-2",
    visual: (
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 font-mono text-xs text-muted-foreground">
          <Lock className="size-3 shrink-0" />
          <span className="truncate">
            eventail.space/publisher/
            <span className="text-primary">yourname</span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-2 text-xs text-muted-foreground">
          <Link2 className="size-3" />
          Copy
        </span>
      </div>
    ),
  },
  {
    Icon: Ticket,
    iconMotion: "group-hover:animate-wiggle",
    title: "External ticket links",
    body: "Keep the ticketing provider you already use. Eventail is the front door; the click goes to your URL.",
    visual: (
      <div className="mt-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-glow">
          Get tickets
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    ),
  },
  {
    Icon: Share2,
    iconMotion: "group-hover:animate-pop",
    title: "Made to be shared",
    body: "Every event page carries its own preview image and event details, so a link looks right in a message, a post or a search result.",
    visual: (
      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-background/60">
        <div className="h-14 bg-gradient-to-br from-glow/50 via-glow-2/30 to-primary/30" />
        <div className="p-3">
          <div className="h-2 w-3/4 rounded-full bg-white/20" />
          <div className="mt-2 h-2 w-1/2 rounded-full bg-white/10" />
        </div>
      </div>
    ),
  },
  {
    Icon: Zap,
    iconMotion: "group-hover:animate-flash",
    title: "Fast and quiet",
    body: "Server-rendered, mobile-first, no bloated dashboards. Publish an event in under a minute.",
    className: "md:col-span-2",
    visual: (
      <div className="mt-8 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-glow to-primary" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          &lt; 60s to publish
        </span>
      </div>
    ),
  },
];

const STEPS = [
  {
    Icon: UserPlus,
    title: "Claim your page",
    body: "Sign up and pick a username. Your page lives at its own link from the first minute.",
  },
  {
    Icon: CalendarPlus,
    title: "Add an event",
    body: "Title, date, place, an image and your ticket link. Save it as a draft or publish straight away.",
  },
  {
    Icon: Send,
    title: "Share the link",
    body: "Every event gets its own page with a rich preview, ready for messages, posts and search.",
  },
];

interface SectionHeadingProps {
  eyebrow: string;
  /** May carry one `font-accent` phrase — the section's key word. */
  title: ReactNode;
  description?: string;
  className?: string;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "reveal-on-scroll mx-auto mb-14 max-w-2xl text-center",
        className,
      )}
    >
      <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
      <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <SiteHeader showSections />

      <main className="-mt-[4.75rem] flex-1 sm:-mt-[5rem]">
        {/* Hero — pulled up under the floating header so the grid and glow
            start at the very top of the page. */}
        <section className="relative isolate overflow-hidden px-6 pt-36 pb-24 md:pt-44 md:pb-32">
          <AmbientBackground variant="hero" />

          <div className="mx-auto max-w-4xl text-center">
            <h1 className="animate-reveal font-display text-5xl leading-[0.95] font-semibold tracking-[-0.02em] [--reveal-delay:80ms] sm:text-6xl md:text-7xl lg:text-8xl">
              Your events,
              <br />
              one{" "}
              <span className="font-accent text-gradient">destination.</span>
            </h1>

            <p className="animate-reveal mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground [--reveal-delay:160ms] md:text-xl">
              The publishing toolkit for artists, venues, and organizers to
              share what is coming up — without fighting a social algorithm for
              the privilege.
            </p>

            {/* Stacked and stretched below `sm`, so both buttons are the
                same full width on a phone; each sizes to its label above. */}
            <div className="animate-reveal mt-10 flex flex-col justify-center gap-3 [--reveal-delay:240ms] sm:flex-row">
              <Link
                href={routes.auth.signUp()}
                className={buttonClass({ size: "lg" })}
              >
                <Sparkles className="size-4" aria-hidden />
                Start publishing free
              </Link>
              <a
                href="#how-it-works"
                className={buttonClass({ variant: "secondary", size: "lg" })}
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="animate-reveal [--reveal-delay:360ms]">
            <HeroPreview />
          </div>
        </section>

        {/* Features — a bento grid. */}
        <section id="features" className="scroll-mt-24 px-6 py-24 md:py-32">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Platform"
              title={
                <>
                  A focused publishing{" "}
                  <span className="font-accent text-gradient">tool,</span> not
                  another marketplace.
                </>
              }
              description="Everything a schedule needs to look good and travel well — nothing that gets in the way of it."
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {FEATURES.map(
                ({ Icon, iconMotion, title, body, className, visual }) => (
                  <div
                    key={title}
                    className={cn(
                      "surface group reveal-on-scroll relative isolate overflow-hidden rounded-3xl p-7 transition-all duration-300 ease-[var(--ease-studio)] hover:-translate-y-1 hover:border-white/15 hover:shadow-lift md:p-8",
                      className,
                    )}
                  >
                    <div
                      aria-hidden
                      className="absolute -top-40 -right-40 -z-10 size-80 bg-radial from-glow/20 to-transparent to-70% opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <div className="mb-6 grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-300 ease-[var(--ease-studio)] group-hover:scale-110 group-hover:bg-primary/15 group-hover:shadow-glow">
                      <Icon className={cn("size-5", iconMotion)} aria-hidden />
                    </div>
                    <h3 className="mb-2 font-display text-xl font-semibold tracking-tight">
                      {title}
                    </h3>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                    {visual ? <div aria-hidden>{visual}</div> : null}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="relative isolate scroll-mt-24 overflow-hidden px-6 py-24 md:py-32"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_50%_at_50%_55%,color-mix(in_oklab,var(--glow)_14%,transparent),transparent)]"
          />
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="How it works"
              title={
                <>
                  From idea to shareable link in{" "}
                  <span className="font-accent text-gradient">
                    three steps.
                  </span>
                </>
              }
            />

            {/* Steps stack on a phone and sit in a row from `md`, with an
                arrow in each gap pointing to the next one. */}
            <ol className="grid grid-cols-1 gap-12 md:grid-cols-3">
              {STEPS.map(({ Icon, title, body }, index) => (
                <li
                  key={title}
                  className="surface group reveal-on-scroll relative rounded-3xl p-7 text-center transition-[border-color,box-shadow] duration-300 hover:border-white/15 hover:shadow-lift md:p-8"
                >
                  <span className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/25 transition-all duration-300 ease-[var(--ease-studio)] group-hover:scale-110 group-hover:shadow-glow">
                    <Icon
                      aria-hidden
                      className="size-6 group-hover:animate-pop"
                    />
                  </span>
                  <h3 className="mb-2 font-display text-xl font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>

                  {index < STEPS.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute -bottom-[2.125rem] left-1/2 z-10 grid size-5 -translate-x-1/2 place-items-center text-primary/80 md:top-1/2 md:-right-[2.125rem] md:bottom-auto md:left-auto md:translate-x-0 md:-translate-y-1/2"
                    >
                      <ArrowDown className="size-5 animate-nudge-y md:hidden" />
                      <ArrowRight className="hidden size-5 animate-nudge-x md:block" />
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Audiences */}
        <section
          id="audience"
          className="scroll-mt-24 overflow-x-clip py-24 md:py-32"
        >
          <AudienceWall
            heading={
              <SectionHeading
                eyebrow="Who it’s for"
                className="mb-6"
                title={
                  <>
                    Anyone with an audience to{" "}
                    <span className="font-accent text-gradient">gather.</span>
                  </>
                }
              />
            }
          />
        </section>

        {/* Closing call to action */}
        <section className="px-6 pb-24 md:pb-32">
          <div className="reveal-on-scroll surface relative isolate mx-auto max-w-5xl overflow-hidden rounded-[2rem] px-6 py-16 text-center md:px-16 md:py-24">
            <div aria-hidden className="bg-grid absolute inset-0 -z-10" />
            <div
              aria-hidden
              className="absolute -bottom-56 left-1/2 -z-10 h-[30rem] w-[52rem] -translate-x-1/2 bg-radial from-glow/30 to-transparent to-70%"
            />
            <div
              aria-hidden
              className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            />

            <h2 className="mb-5 font-display text-4xl font-semibold tracking-tight md:text-6xl">
              Claim your page in{" "}
              <span className="font-accent text-gradient">60 seconds.</span>
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
              Free to publish. No credit card, no setup fees. Add your next
              event and start sharing the link.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={routes.auth.signUp()}
                className={buttonClass({ size: "lg" })}
              >
                Create your page
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={routes.auth.signIn()}
                className={buttonClass({ variant: "secondary", size: "lg" })}
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
