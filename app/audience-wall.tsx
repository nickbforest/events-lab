import {
  Beer,
  Brush,
  Church,
  Clapperboard,
  Coffee,
  Drama,
  Frame,
  Guitar,
  Headphones,
  Landmark,
  Laugh,
  type LucideIcon,
  Music,
  Palette,
  PartyPopper,
  Presentation,
  School,
  Store,
  Tent,
  Trophy,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";

/**
 * Card grounds: soft two-stop gradients near the page's own violet, indigo
 * and lime, plus a few warm accents, graphite and pearl — distinct from the
 * page but never neon. Each carries the text colour that reads on it.
 */
const GROUNDS = {
  violet: "from-[#9b85ff] to-[#5d45d6] text-white",
  lime: "from-[#d9f27a] to-[#9fc43f] text-[#1d2408]",
  graphite: "from-[#3a3a47] to-[#1d1d25] text-white",
  indigo: "from-[#7f95ff] to-[#3f4fc4] text-white",
  rose: "from-[#f3a3c2] to-[#c25586] text-white",
  teal: "from-[#6fd8c9] to-[#24917f] text-white",
  pearl: "from-[#f6f5fa] to-[#d8d6e4] text-[#2a2550]",
  amber: "from-[#f6c983] to-[#d38a3c] text-white",
  plum: "from-[#c3a4f5] to-[#7d52c9] text-white",
  sky: "from-[#86c9f2] to-[#3a84c4] text-white",
} as const;

interface Audience {
  label: string;
  Icon: LucideIcon;
  ground: keyof typeof GROUNDS;
}

const AUDIENCES: Audience[] = [
  { label: "Musicians", Icon: Music, ground: "violet" },
  { label: "Theaters", Icon: Drama, ground: "lime" },
  { label: "DJs", Icon: Headphones, ground: "plum" },
  { label: "Festivals", Icon: Tent, ground: "sky" },
  { label: "Cinemas", Icon: Clapperboard, ground: "teal" },
  { label: "Comedians", Icon: Laugh, ground: "rose" },
  { label: "Sport clubs", Icon: Trophy, ground: "graphite" },
  { label: "Artists", Icon: Palette, ground: "amber" },
  { label: "Bars", Icon: Beer, ground: "teal" },
  { label: "Cafes", Icon: Coffee, ground: "amber" },
  { label: "Bands", Icon: Guitar, ground: "rose" },
  { label: "Galleries", Icon: Frame, ground: "pearl" },
  { label: "Clubs", Icon: PartyPopper, ground: "indigo" },
  { label: "Communities", Icon: Users, ground: "lime" },
  { label: "Conferences", Icon: Presentation, ground: "graphite" },
  { label: "Painters", Icon: Brush, ground: "plum" },
  { label: "Schools", Icon: School, ground: "indigo" },
  { label: "Churches", Icon: Church, ground: "pearl" },
  { label: "Venues", Icon: Landmark, ground: "sky" },
  { label: "Local businesses", Icon: Store, ground: "violet" },
];

/** Seconds per loop, per column — no two columns move in step. */
const SPEEDS = [46, 38, 50, 42, 52, 36, 48];
const CENTRE = Math.floor(SPEEDS.length / 2);

/**
 * The pyramid: the centre column is the tallest and each step out is
 * shorter, so the wall's lower edge is a V (after the App Store's icon
 * cascade). Outer steps also drop out on narrow screens — phones keep the
 * centre three, tablets five, wide screens all seven.
 */
const STEPS = [
  { height: "100%", show: "block" },
  { height: "82%", show: "block" },
  { height: "64%", show: "hidden md:block" },
  { height: "46%", show: "hidden xl:block" },
];

/**
 * Five different audiences per column, picked by a stride through the list
 * so neighbouring columns never start on the same card.
 */
const COLUMNS = SPEEDS.map((seconds, column) => ({
  seconds,
  step: STEPS[Math.abs(column - CENTRE)],
  cards: Array.from(
    { length: 5 },
    (_, row) => AUDIENCES[(column * 3 + row * 4) % AUDIENCES.length],
  ),
}));

function AudienceCard({ label, Icon, ground }: Audience) {
  return (
    // Bottom padding, not a flex gap, so the doubled track is exactly two
    // equal halves and the loop never jumps.
    <div className="pb-3 md:pb-4 xl:pb-5">
      <div
        className={cn(
          "relative isolate flex size-[6.5rem] flex-col justify-between overflow-hidden rounded-[1.4rem] bg-gradient-to-b p-3 opacity-50 shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_16px_32px_-16px_rgb(0_0_0/0.9)] ring-1 ring-white/10 transition-[opacity,scale] duration-300 ease-[var(--ease-studio)] hover:scale-105 hover:opacity-100 md:size-32 md:rounded-[1.6rem] md:p-3.5 xl:size-[9.5rem] xl:rounded-[1.85rem] xl:p-4 2xl:size-44 2xl:rounded-[2rem] 2xl:p-5",
          GROUNDS[ground],
        )}
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_20%_0%,rgb(255_255_255/0.25),transparent_55%)]" />
        <span className="grid size-9 place-items-center rounded-xl bg-black/15 md:size-10 xl:size-11">
          <Icon className="size-[1.125rem] md:size-5 xl:size-6" />
        </span>
        <span className="font-display text-sm leading-tight font-semibold tracking-tight md:text-base xl:text-lg">
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * "Who it's for": the heading and the caption that names every audience,
 * then a pyramid of audience cards streaming slowly downward in endless
 * columns. Each column fades in at the top and out at its own lower edge,
 * so cards seem to arrive from above and leave below, and the uneven
 * column lengths draw the V. Hovering a column pauses it; a hovered card
 * comes to full colour. Pure CSS; still under reduced motion. The cards are decorative — the caption carries the
 * list.
 */
export function AudienceWall({ heading }: { heading: ReactNode }) {
  return (
    <>
      <div className="px-6">
        {heading}
        <p className="reveal-on-scroll mx-auto mb-14 max-w-2xl text-center text-base leading-relaxed text-muted-foreground md:text-lg">
          Musicians, bands, DJs, painters, artists and galleries; theaters,
          cinemas, venues, bars, cafes and clubs; sport clubs, schools,
          churches, communities, conferences, festivals and local businesses —{" "}
          <span className="text-foreground">
            if people gather for it, it belongs here.
          </span>
        </p>
      </div>

      <div
        aria-hidden
        className="flex h-[24rem] items-start justify-center gap-3 md:h-[30rem] md:gap-4 xl:h-[36rem] xl:gap-5"
      >
        {COLUMNS.map(({ seconds, step, cards }, column) => (
          <div
            key={seconds}
            className={cn(
              "shrink-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_68%,transparent)]",
              step.show,
            )}
            style={{ height: step.height }}
          >
            <div
              className="animate-stream-down hover:[animation-play-state:paused]"
              style={{
                animationDuration: `${seconds}s`,
                // Start each column part-way through its loop.
                animationDelay: `-${(column * 7) % seconds}s`,
              }}
            >
              {/* The cards twice: the second copy fills in as the first
                  slides down, so the loop has no seam. */}
              {(["first", "second"] as const).flatMap((copy) =>
                cards.map((audience) => (
                  <AudienceCard
                    key={`${copy}-${audience.label}`}
                    {...audience}
                  />
                )),
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
