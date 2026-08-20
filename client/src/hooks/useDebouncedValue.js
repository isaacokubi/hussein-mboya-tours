import { useEffect, useState } from "react";

/**
 * Keeps fast-changing form/search input local to the component while
 * delaying expensive API/query work until the user pauses typing.
 * This prevents a query/loading render from replacing an input after
 * every keystroke and losing focus/caret position.
 */
export default function useDebouncedValue(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
