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

  return (
    <div className="rounded-xl overflow-hidden shadow-lg bg-white transition hover:shadow-2xl">
      <div className="overflow-hidden">
        <LazyImage
          src={imageUrl}
          alt={destination.name || "Destination"}
          fallback={getFallbackImage(destination)}
          className="h-60 w-full object-cover hover:scale-105 transition duration-500"
        />
      </div>

      <div className="p-5">
        <h2 className="text-2xl font-bold text-gray-800">
          {destination.name || "Destination"}
        </h2>

        <p className="text-gray-600 mt-2">{destination.country || "Kenya"}</p>

        {destination.description && (
          <p className="text-sm text-gray-500 mt-3 line-clamp-3">
            {destination.description}
          </p>
        )}

        <Link
          to={`/destinations/${destination.slug || destination._id}`}
          className="inline-block mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          Explore Destination
        </Link>
      </div>
    </div>
  );
}
