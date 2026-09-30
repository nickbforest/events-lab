import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { RESERVED_USERNAMES } from "@/features/profiles/bll/profiles-service";

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");
const START = "-- reserved-usernames:start";
const END = "-- reserved-usernames:end";

/**
 * The reserved list the database trigger enforces, read from the most recent
 * migration that defines it. Migrations are history, so the latest definition
 * is the one in force.
 */
function reservedInLatestMigration(): string[] {
  const latest = readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => readFileSync(join(MIGRATIONS_DIR, name), "utf8"))
    .filter((sql) => sql.includes(START))
    .at(-1);

  if (!latest) {
    throw new Error("No migration defines the reserved-usernames list.");
  }

  const block = latest.slice(latest.indexOf(START), latest.indexOf(END));
  return [...block.matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

describe("reserved usernames", () => {
  it("are identical in the application and the signup trigger", () => {
    expect(reservedInLatestMigration().sort()).toEqual(
      [...RESERVED_USERNAMES].sort(),
    );
  });
});
