import { Link } from "react-router-dom";
import LazyImage from "../common/LazyImage";

const FALLBACK_DESTINATION_IMAGES = [
  "/gallery/mara.jpg",
  "/gallery/amboseli.jpg",
  "/gallery/diani.jpg",
  "/gallery/beach.jpg",
  "/gallery/culture.jpg",
  "/gallery/safari.jpg",
  "/hero2.jpeg",
  "/hero4.jpeg",
];

const resolveMediaUrl = (value) => {
  if (!value) return "";
  const raw = typeof value === "string"
    ? value
    : value?.url || value?.secure_url || value?.path || "";
  if (!raw) return "";
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  const base = String(import.meta.env.VITE_API_URL || "")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");
  return raw.startsWith("/") && base ? `${base}${raw}` : raw;
};

const getFallbackImage = (destination) => {
  const stable = String(destination?._id || destination?.slug || destination?.name || "destination");
  const hash = [...stable].reduce(
    (sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0,
    0
  );
  return FALLBACK_DESTINATION_IMAGES[hash % FALLBACK_DESTINATION_IMAGES.length];
};

export default function DestinationCard({ destination = {} }) {
  const candidates = [
    ...(Array.isArray(destination.images) ? destination.images : []),
    destination.featuredImage,
    destination.image,
    destination.thumbnail,
  ];

  const imageUrl = resolveMediaUrl(candidates.find(Boolean)) || getFallbackImage(destination);
  const fallbackImage = getFallbackImage(destination);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
      <div className="overflow-hidden bg-slate-800">
        <LazyImage
          src={imageUrl}
          alt={destination.name || "Destination"}
          fallback={fallbackImage}
          className="h-60 w-full object-cover transition duration-500 hover:scale-105"
        />
      </div>

      <div className="p-5">
        <h2 className="text-2xl font-bold text-white">
          {destination.name || "Destination"}
        </h2>

        <p className="mt-2 text-slate-300">{destination.country || "Kenya"}</p>

        {destination.description && (
          <p className="mt-3 line-clamp-3 text-sm text-slate-400">
            {destination.description}
          </p>
        )}

        <Link
          to={`/destinations/${destination.slug || destination._id}`}
          className="mt-4 inline-block rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-yellow-400"
        >
          Explore Destination
        </Link>
      </div>
    </div>
  );
}
