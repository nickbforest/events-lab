import { z } from "zod";

/**
 * Countries, as full names for people and ISO 3166-1 alpha-2 codes for the
 * database.
 *
 * `events.country_code` and `profiles.country_code` are two-letter codes with
 * a `^[A-Z]{2}$` constraint, because a code is stable, sorts, and can be
 * filtered and indexed. Nobody should have to type one, so every surface
 * shows the full name and stores the code.
 *
 * Names come from `Intl.DisplayNames` rather than a hard-coded table: the
 * runtime already ships them, they stay correct as countries are renamed, and
 * translating the picker later is a locale argument rather than a new list.
 */

/** ISO 3166-1 alpha-2, the assigned codes only. */
const ISO_ALPHA2 = [
  "AD",
  "AE",
  "AF",
  "AG",
  "AI",
  "AL",
  "AM",
  "AO",
  "AQ",
  "AR",
  "AS",
  "AT",
  "AU",
  "AW",
  "AX",
  "AZ",
  "BA",
  "BB",
  "BD",
  "BE",
  "BF",
  "BG",
  "BH",
  "BI",
  "BJ",
  "BL",
  "BM",
  "BN",
  "BO",
  "BQ",
  "BR",
  "BS",
  "BT",
  "BV",
  "BW",
  "BY",
  "BZ",
  "CA",
  "CC",
  "CD",
  "CF",
  "CG",
  "CH",
  "CI",
  "CK",
  "CL",
  "CM",
  "CN",
  "CO",
  "CR",
  "CU",
  "CV",
  "CW",
  "CX",
  "CY",
  "CZ",
  "DE",
  "DJ",
  "DK",
  "DM",
  "DO",
  "DZ",
  "EC",
  "EE",
  "EG",
  "EH",
  "ER",
  "ES",
  "ET",
  "FI",
  "FJ",
  "FK",
  "FM",
  "FO",
  "FR",
  "GA",
  "GB",
  "GD",
  "GE",
  "GF",
  "GG",
  "GH",
  "GI",
  "GL",
  "GM",
  "GN",
  "GP",
  "GQ",
  "GR",
  "GS",
  "GT",
  "GU",
  "GW",
  "GY",
  "HK",
  "HM",
  "HN",
  "HR",
  "HT",
  "HU",
  "ID",
  "IE",
  "IL",
  "IM",
  "IN",
  "IO",
  "IQ",
  "IR",
  "IS",
  "IT",
  "JE",
  "JM",
  "JO",
  "JP",
  "KE",
  "KG",
  "KH",
  "KI",
  "KM",
  "KN",
  "KP",
  "KR",
  "KW",
  "KY",
  "KZ",
  "LA",
  "LB",
  "LC",
  "LI",
  "LK",
  "LR",
  "LS",
  "LT",
  "LU",
  "LV",
  "LY",
  "MA",
  "MC",
  "MD",
  "ME",
  "MF",
  "MG",
  "MH",
  "MK",
  "ML",
  "MM",
  "MN",
  "MO",
  "MP",
  "MQ",
  "MR",
  "MS",
  "MT",
  "MU",
  "MV",
  "MW",
  "MX",
  "MY",
  "MZ",
  "NA",
  "NC",
  "NE",
  "NF",
  "NG",
  "NI",
  "NL",
  "NO",
  "NP",
  "NR",
  "NU",
  "NZ",
  "OM",
  "PA",
  "PE",
  "PF",
  "PG",
  "PH",
  "PK",
  "PL",
  "PM",
  "PN",
  "PR",
  "PS",
  "PT",
  "PW",
  "PY",
  "QA",
  "RE",
  "RO",
  "RS",
  "RU",
  "RW",
  "SA",
  "SB",
  "SC",
  "SD",
  "SE",
  "SG",
  "SH",
  "SI",
  "SJ",
  "SK",
  "SL",
  "SM",
  "SN",
  "SO",
  "SR",
  "SS",
  "ST",
  "SV",
  "SX",
  "SY",
  "SZ",
  "TC",
  "TD",
  "TF",
  "TG",
  "TH",
  "TJ",
  "TK",
  "TL",
  "TM",
  "TN",
  "TO",
  "TR",
  "TT",
  "TV",
  "TW",
  "TZ",
  "UA",
  "UG",
  "UM",
  "US",
  "UY",
  "UZ",
  "VA",
  "VC",
  "VE",
  "VG",
  "VI",
  "VN",
  "VU",
  "WF",
  "WS",
  "YE",
  "YT",
  "ZA",
  "ZM",
  "ZW",
] as const;

export interface Country {
  /** ISO 3166-1 alpha-2, what the column stores. */
  code: string;
  /** The full name, what a person reads and picks. */
  name: string;
}

function buildCountries(): Country[] {
  let display: Intl.DisplayNames | null = null;
  try {
    display = new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    // Every runtime we target has this; falling back to bare codes keeps the
    // picker usable rather than empty if one does not.
    display = null;
  }

  return ISO_ALPHA2.map((code) => ({
    code,
    name: display?.of(code) ?? code,
  })).sort((a, b) => a.name.localeCompare(b.name));
}

/** Alphabetical by name, built once per process. */
export const COUNTRIES: readonly Country[] = buildCountries();

const NAME_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c.name]));

/** The full name for a stored code, or the code itself if it is unknown. */
export function countryName(code: string | null | undefined): string | null {
  if (!code) {
    return null;
  }
  return NAME_BY_CODE.get(code.toUpperCase()) ?? code;
}

const CODE_BY_NAME = new Map(
  COUNTRIES.map((c) => [c.name.toLowerCase(), c.code]),
);

const KNOWN_CODES = new Set(COUNTRIES.map((c) => c.code));

/**
 * Resolves what someone typed into an ISO code, or null if it is not a
 * country we know.
 *
 * Accepts the full name in any casing ("georgia", "Georgia") and the code
 * itself, because someone who knows "GE" should not be made to spell it out.
 */
export function countryCodeFromInput(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const upper = trimmed.toUpperCase();
  if (upper.length === 2 && KNOWN_CODES.has(upper)) {
    return upper;
  }

  return CODE_BY_NAME.get(trimmed.toLowerCase()) ?? null;
}

/**
 * A country, typed by hand, for any form that stores `country_code`.
 *
 * The column stores an ISO alpha-2 code, because "Georgia", "georgia" and
 * "GE" must not become three different countries the day discovery filters
 * by one. So the field is free text and this resolves it — the person writes
 * a country, the row keeps a code. Empty is allowed and stored as null.
 */
export const optionalCountrySchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (value === "") {
      return null;
    }

    const code = countryCodeFromInput(value);
    if (!code) {
      ctx.addIssue({
        code: "custom",
        error: `We do not recognise “${value}” as a country.`,
      });
      return null;
    }

    return code;
  });
