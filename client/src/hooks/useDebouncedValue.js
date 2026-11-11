/**
 * Purpose: use Debounced Value reusable React hook. Main declarations: useDebouncedValue.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useState } from "react";

/**
 * Keeps fast-changing form/search input local to the component while
 * delaying expensive API/query work until the user pauses typing.
 * This prevents a query/loading render from replacing an input after
 * every keystroke and losing focus/caret position.
 */
// Define useDebouncedValue; its parameters and body implement this operation.
export default function useDebouncedValue(value, delay = 350) {
  // Declare [debouncedValue, setDebouncedValue] for use by the surrounding module or function.
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Declare timer for use by the surrounding module or function.
    const timer = window.setTimeout(() => {
      // Perform the side effect or state update expressed on the following line.
      setDebouncedValue(value);
    }, delay);

    // Return the expression shown below to the caller.
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  // Return the value of debouncedValue to the caller.
  return debouncedValue;
}
