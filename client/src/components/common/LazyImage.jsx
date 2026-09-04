import { useEffect, useState } from "react";

const normalizeImageSource = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const first = value.find(Boolean);
    return normalizeImageSource(first);
  }

  return (
    value?.url ||
    value?.secure_url ||
    value?.src ||
    value?.imageUrl ||
    value?.featuredImage ||
    value?.path ||
    ""
  );
};

export default function LazyImage({
  src,
  alt = "",
  className = "",
  fallback = "/images/image-placeholder.jpg",
}) {
  const normalizedSource = normalizeImageSource(src);
  const normalizedFallback = normalizeImageSource(fallback) || "/images/image-placeholder.jpg";
  const [imageSrc, setImageSrc] = useState(normalizedSource || normalizedFallback);

  useEffect(() => {
    setImageSrc(normalizedSource || normalizedFallback);
  }, [normalizedSource, normalizedFallback]);

  return (
    <div className="relative overflow-hidden">
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`block opacity-100 transition-transform duration-500 ${className}`}
        onError={(event) => {
          if (event.currentTarget.dataset.fallbackApplied === "true") return;
          event.currentTarget.dataset.fallbackApplied = "true";
          setImageSrc(normalizedFallback);
        }}
      />
    </div>
  );
}
