import { COUNTRIES } from "@/lib/countries";

export interface CountryOptionsProps {
  /** Referenced by the input's `list` attribute; unique on the page. */
  id: string;
}

/**
 * Suggestions for a country field. The field stays free text — this only
 * saves typing, it does not constrain what can be entered. The schema
 * (`optionalCountrySchema`) turns what was typed into a code.
 */
export function CountryOptions({ id }: CountryOptionsProps) {
  return (
    <datalist id={id}>
      {COUNTRIES.map((country) => (
        <option key={country.code} value={country.name} />
      ))}
    </datalist>
  );
}
