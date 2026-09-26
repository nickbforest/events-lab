/**
 * Wall-clock ↔ instant conversion for a named IANA zone.
 *
 * An event is entered as a wall-clock reading ("7pm on the 1st") in a chosen
 * zone, and stored as an instant. `datetime-local` inputs carry no zone, so
 * something has to bridge the two. `date-fns` v4 does this only through the
 * separate `@date-fns/tz` package; these few functions use `Intl`, which is
 * already in the runtime, rather than adding a dependency for them.
 */

const FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  const existing = FORMATTERS.get(timeZone);
  if (existing) return existing;

  const created = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  FORMATTERS.set(timeZone, created);
  return created;
}

/** The reading a clock in `timeZone` shows at `instant`, as a UTC timestamp. */
function wallClockAsUtc(instant: Date, timeZone: string): number {
  const parts = formatter(timeZone).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  // Some engines render midnight as hour 24 of the previous day.
  const hour = read("hour") % 24;

  return Date.UTC(
    read("year"),
    read("month") - 1,
    read("day"),
    hour,
    read("minute"),
    read("second"),
  );
}

/** How far `timeZone` runs ahead of UTC at `instant`, in minutes. */
export function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  return (wallClockAsUtc(instant, timeZone) - instant.getTime()) / 60_000;
}

const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/**
 * Reads a `datetime-local` value as a wall-clock time in `timeZone`.
 *
 * Resolved in two passes: the offset is looked up at an approximate instant,
 * then again at the corrected one, because the first guess can land on the
 * wrong side of a daylight-saving change.
 */
export function wallClockToInstant(
  wallClock: string,
  timeZone: string,
): Date | null {
  const match = WALL_CLOCK.exec(wallClock.trim());
  if (!match) return null;

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const naive = Date.UTC(year, month - 1, day, hour, minute);

  let instant = naive - zoneOffsetMinutes(new Date(naive), timeZone) * 60_000;
  instant = naive - zoneOffsetMinutes(new Date(instant), timeZone) * 60_000;

  return Number.isNaN(instant) ? null : new Date(instant);
}

/** The same, returning the ISO instant a contract expects, or "". */
export function wallClockToIso(wallClock: string, timeZone: string): string {
  if (!wallClock.trim()) return "";
  return wallClockToInstant(wallClock, timeZone)?.toISOString() ?? "";
}

/** The inverse: an instant rendered as a `datetime-local` value. */
export function instantToWallClock(
  iso: string | null,
  timeZone: string,
): string {
  if (!iso) return "";

  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) return "";

  const parts = formatter(timeZone).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  const hour = String(Number(read("hour")) % 24).padStart(2, "0");

  return `${read("year")}-${read("month")}-${read("day")}T${hour}:${read("minute")}`;
}

/**
 * Zones offered in the picker. The full IANA list is several hundred entries
 * and unusable as a `<select>`; the runtime's list is still the authority for
 * validation, so a publisher is never blocked by an absence here.
 */
export const COMMON_TIME_ZONES = [
  "Asia/Tbilisi",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Warsaw",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Africa/Cairo",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "UTC",
] as const;

/** The viewer's own zone when we can offer it, falling back to Tbilisi. */
export function defaultTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tbilisi";
  } catch {
    return "Asia/Tbilisi";
  }
}
