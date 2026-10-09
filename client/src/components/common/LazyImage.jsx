import { useEffect, useState } from "react";

const DEFAULT_IMAGE_FALLBACK = "/demo-destinations/kenya-landscape-01.svg";

export default function LazyImage({
  src,
  alt = "",
  className = "",
  fallback = DEFAULT_IMAGE_FALLBACK,
}) {
  const normalizedSource = typeof src === "object" ? src?.url : src;
  const [imageSrc, setImageSrc] = useState(normalizedSource || fallback);
  const [loading, setLoading] = useState(true);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  useEffect(() => {
    setImageSrc(normalizedSource || fallback);
    setLoading(true);
    setFallbackFailed(false);
  }, [normalizedSource, fallback]);

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
