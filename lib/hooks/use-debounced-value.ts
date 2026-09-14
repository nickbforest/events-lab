"use client";

import { useEffect, useState } from "react";

/**
 * Holds a value still for `delay` milliseconds. Used to keep per-keystroke
 * input from becoming per-keystroke network requests.
 */
export function useDebouncedValue<TValue>(
  value: TValue,
  delay: number,
): TValue {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}
