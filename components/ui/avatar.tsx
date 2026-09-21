import Image from "next/image";

import { cn } from "@/lib/format";

/**
 * A publisher's image, or the first letter of their name when they have none.
 *
 * Decorative in every current use — the name is always printed beside it — so
 * both the image and the letter are hidden from assistive technology.
 * `className` sets size and letter weight; `sizes` must match the rendered
 * width so next/image does not fetch a larger file than it shows.
 */
export function Avatar({
  src,
  name,
  sizes,
  className,
}: {
  src: string | null;
  name: string;
  sizes: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-lg bg-secondary font-display",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        name[0]?.toUpperCase()
      )}
    </span>
  );
}
