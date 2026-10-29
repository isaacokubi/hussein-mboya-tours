import { Suspense, useEffect, useRef, useState } from "react";

const ObserverFallback = ({ className }) => (
  <div aria-hidden="true" className={`animate-pulse motion-reduce:animate-none rounded-2xl bg-slate-200/60 ${className}`} />
);

/** Mount a below-the-fold section only as it approaches the viewport. */
export default function DeferredSection({
  children,
  placeholderClassName = "min-h-40",
  rootMargin = "350px 0px",
}) {
  const host = useRef(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (entered || !host.current) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setEntered(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setEntered(true);
      observer.disconnect();
    }, { rootMargin });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, [entered, rootMargin]);

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
