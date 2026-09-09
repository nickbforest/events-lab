import Link from "next/link";
import { BarChart3, Globe, Sparkles, Zap } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const FEATURES = [
  {
    Icon: Globe,
    title: "Your own public page",
    body: "Every publisher gets events-lab/yourname — a shareable, SEO-ready home for your upcoming schedule.",
  },
  {
    Icon: Zap,
    title: "External ticket links",
    body: "Keep the ticketing provider you already use. events-lab is the front door; the click goes to your URL.",
  },
  {
    Icon: BarChart3,
    title: "Built for discovery",
    body: "Search, categories, cities and dates. People find your event without needing to follow you first.",
  },
  {
    Icon: Sparkles,
    title: "Fast and quiet",
    body: "Server-rendered, mobile-first, no bloated dashboards. Publish an event in under a minute.",
  },
];

const AUDIENCES = [
  "Musicians", "Bands", "Painters", "Artists", "Sport Clubs",
  "Cinemas", "Theaters", "Bars", "Cafes", "Clubs",
  "Conference Organizers", "Schools", "Churches", "Communities",
  "Local Businesses", "DJs", "Comedians", "Festivals",
];

export default function LandingPage() {
  const marquee = [...AUDIENCES, ...AUDIENCES];

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="overflow-hidden border-b border-border px-6 pb-32 pt-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-[820px] animate-reveal">
              <span className="mb-6 block font-mono text-xs uppercase tracking-widest text-primary">
                Universal event publishing
              </span>
              <h1 className="mb-8 font-display text-5xl font-extrabold leading-[0.9] tracking-tighter md:text-7xl lg:text-8xl">
                YOUR EVENTS,
                <br />
                ONE DESTINATION.
              </h1>
              <p className="mb-10 max-w-[560px] text-lg leading-relaxed text-muted-foreground md:text-xl">
                The publishing toolkit for artists, venues, and organizers to
                share what is coming up — without fighting a social algorithm
                for the privilege.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/auth?mode=signup"
                  className="rounded-md bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-all hover:brightness-110"
                >
                  Start publishing free
                </Link>
                <Link
                  href="/discover"
                  className="rounded-md border border-border px-8 py-4 text-lg font-medium transition-colors hover:bg-white/5"
                >
                  Browse events
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 max-w-2xl">
              <div className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
                Platform
              </div>
              <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
                A focused publishing tool, not another marketplace.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
              {FEATURES.map(({ Icon, title, body }) => (
                <div key={title} className="bg-background p-8">
                  <Icon className="mb-6 size-5 text-primary" aria-hidden />
                  <h3 className="mb-2 font-display text-lg font-extrabold uppercase">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-b border-border py-24">
          <div className="mx-auto mb-12 max-w-7xl px-6">
            <div className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
              Who it&rsquo;s for
            </div>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
              Anyone with an audience to gather.
            </h2>
          </div>

          <div aria-hidden className="relative space-y-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

            <div className="flex w-max animate-marquee gap-4">
              {marquee.map((word, i) => (
                <span
                  key={`a-${i}`}
                  className="shrink-0 rounded-full border border-border bg-white/[0.02] px-6 py-3 font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl"
                >
                  {word}
                </span>
              ))}
            </div>
            <div className="flex w-max animate-marquee-reverse gap-4">
              {marquee.map((word, i) => (
                <span
                  key={`b-${i}`}
                  className="shrink-0 rounded-full border border-primary/40 px-6 py-3 font-display text-2xl font-extrabold uppercase tracking-tight text-primary md:text-3xl"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-display text-3xl font-extrabold uppercase tracking-tighter md:text-5xl">
              Claim your page in 60 seconds.
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              Free to publish. No credit card, no setup fees. Add your next
              event and start sharing the link.
            </p>
            <Link
              href="/auth?mode=signup"
              className="inline-block rounded-md bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-all hover:brightness-110"
            >
              Create your page →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
