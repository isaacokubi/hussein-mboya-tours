/**
 * Purpose: Destination Card reusable UI component. Main declarations: resolveMediaUrl, getFallbackImage, DestinationCard.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { Link } from "react-router-dom";
// Load ../common/LazyImage so this module can use its exported dependencies.
import LazyImage from "../common/LazyImage";

// Declare FALLBACK_DESTINATION_IMAGES for use by the surrounding module or function.
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

// Declare resolveMediaUrl for use by the surrounding module or function.
const resolveMediaUrl = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "";
  // Declare raw for use by the surrounding module or function.
  const raw = typeof value === "string"
    ? value
    : value?.url || value?.secure_url || value?.path || "";
  // Check the condition (!raw) and run the matching branch.
  if (!raw) return "";
  // Check the condition (/^(https?:|data:|blob:)/i.test(raw)) and run the matching branch.
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  // Check the condition (/^\/(?:destinations|gallery|demo-destinations)\//.test(raw) || /^\/her) and run the matching branch.
  if (/^\/(?:destinations|gallery|demo-destinations)\//.test(raw) || /^\/hero\d+\.(?:jpe?g|png|webp)$/i.test(raw)) return raw;
  // Declare base for use by the surrounding module or function.
  const base = String(import.meta.env.VITE_API_URL || "")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");
  // Return the expression shown below to the caller.
  return raw.startsWith("/") && base ? `${base}${raw}` : raw;
};

// Declare getFallbackImage for use by the surrounding module or function.
const getFallbackImage = (destination) => {
  // Declare stable for use by the surrounding module or function.
  const stable = String(destination?._id || destination?.slug || destination?.name || "destination");
  // Declare hash for use by the surrounding module or function.
  const hash = [...stable].reduce(
    (sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0,
    0
  );
  // Return the expression shown below to the caller.
  return FALLBACK_DESTINATION_IMAGES[hash % FALLBACK_DESTINATION_IMAGES.length];
};

// Define DestinationCard; its parameters and body implement this operation.
export default function DestinationCard({ destination = {} }) {
  // Declare candidates for use by the surrounding module or function.
  const candidates = [
    ...(Array.isArray(destination.images) ? destination.images : []),
    destination.featuredImage,
    destination.image,
    destination.thumbnail,
  ];

  // Declare imageUrl for use by the surrounding module or function.
  const imageUrl = resolveMediaUrl(candidates.find(Boolean)) || getFallbackImage(destination);

  // Return the expression shown below to the caller.
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
