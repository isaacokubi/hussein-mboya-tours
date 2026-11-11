/**
 * Purpose: Lazy Image reusable UI component. Main declarations: LazyImage.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useState } from "react";

// Declare DEFAULT_IMAGE_FALLBACK for use by the surrounding module or function.
const DEFAULT_IMAGE_FALLBACK = "/demo-destinations/kenya-landscape-01.svg";

// Define LazyImage; its parameters and body implement this operation.
export default function LazyImage({
  src,
  alt = "",
  className = "",
  fallback = DEFAULT_IMAGE_FALLBACK,
}) {
  // Declare normalizedSource for use by the surrounding module or function.
  const normalizedSource = typeof src === "object" ? src?.url : src;
  // Declare [imageSrc, setImageSrc] for use by the surrounding module or function.
  const [imageSrc, setImageSrc] = useState(normalizedSource || fallback);
  // Declare [loading, setLoading] for use by the surrounding module or function.
  const [loading, setLoading] = useState(true);
  // Declare [fallbackFailed, setFallbackFailed] for use by the surrounding module or function.
  const [fallbackFailed, setFallbackFailed] = useState(false);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Perform the side effect or state update expressed on the following line.
    setImageSrc(normalizedSource || fallback);
    // Perform the side effect or state update expressed on the following line.
    setLoading(true);
    // Perform the side effect or state update expressed on the following line.
    setFallbackFailed(false);
  }, [normalizedSource, fallback]);

  // Return the expression shown below to the caller.
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-amber-700">
      {loading && !fallbackFailed && <div className="absolute inset-0 animate-pulse bg-slate-200/30" aria-hidden="true" />}
      {!fallbackFailed && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"} ${className}`}
          onLoad={() => setLoading(false)}
          onError={() => {
            if (imageSrc !== fallback) {
              setImageSrc(fallback);
              setLoading(true);
            } else {
              setFallbackFailed(true);
              setLoading(false);
            }
          }}
        />
      )}
    </div>
  );
}
