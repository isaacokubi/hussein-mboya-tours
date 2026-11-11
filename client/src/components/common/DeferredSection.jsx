/**
 * Purpose: Deferred Section reusable UI component. Main declarations: ObserverFallback, DeferredSection.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { Suspense, useEffect, useRef, useState } from "react";

// Declare ObserverFallback for use by the surrounding module or function.
const ObserverFallback = ({ className }) => (
  <div aria-hidden="true" className={`animate-pulse motion-reduce:animate-none rounded-2xl bg-slate-200/60 ${className}`} />
);

/** Mount a below-the-fold section only as it approaches the viewport. */
// Define DeferredSection; its parameters and body implement this operation.
export default function DeferredSection({
  children,
  placeholderClassName = "min-h-40",
  rootMargin = "350px 0px",
}) {
  // Declare host for use by the surrounding module or function.
  const host = useRef(null);
  // Declare [entered, setEntered] for use by the surrounding module or function.
  const [entered, setEntered] = useState(false);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (entered || !host.current) and run the matching branch.
    if (entered || !host.current) return undefined;
    // Check the condition (typeof IntersectionObserver === "undefined") and run the matching branch.
    if (typeof IntersectionObserver === "undefined") {
      // Perform the side effect or state update expressed on the following line.
      setEntered(true);
      // Return the value of undefined to the caller.
      return undefined;
    }

    // Declare observer for use by the surrounding module or function.
    const observer = new IntersectionObserver(([entry]) => {
      // Check the condition (!entry.isIntersecting) and run the matching branch.
      if (!entry.isIntersecting) return;
      // Perform the side effect or state update expressed on the following line.
      setEntered(true);
      // Perform the side effect or state update expressed on the following line.
      observer.disconnect();
    }, { rootMargin });
    // Perform the side effect or state update expressed on the following line.
    observer.observe(host.current);
    // Return the expression shown below to the caller.
    return () => observer.disconnect();
  }, [entered, rootMargin]);

  // Return the expression shown below to the caller.
  return (
    <div ref={host}>
      {entered ? (
        <Suspense fallback={<ObserverFallback className={placeholderClassName} />}>
          {children}
        </Suspense>
      ) : <ObserverFallback className={placeholderClassName} />}
    </div>
  );
}
