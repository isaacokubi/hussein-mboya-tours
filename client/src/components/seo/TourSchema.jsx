/**
 * Purpose: Tour Schema reusable UI component. Main declarations: TourSchema.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useSettings } from "../../context/SettingsContext";
// Load react-helmet-async so this module can use its exported dependencies.
import { Helmet } from "react-helmet-async";

// Declare SITE_URL for use by the surrounding module or function.
const SITE_URL = String(import.meta.env.VITE_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");

// Define TourSchema; its parameters and body implement this operation.
export default function TourSchema({ tour }) {
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Check the condition (!tour) and run the matching branch.
  if (!tour) return null;

  // Declare image for use by the surrounding module or function.
  const image =
    typeof tour.images?.[0] === "object"
      ? tour.images?.[0]?.url
      : tour.images?.[0];

  // Declare schema for use by the surrounding module or function.
  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",

    name: tour.title,

    description:
      tour.shortDescription ||
      tour.description,

    image: image
      ? (image?.url || image)?.startsWith("http")
        ? image
        : `${SITE_URL}${image}`
      : undefined,

    url: `${SITE_URL}/tours/${tour.slug || tour._id}`,

    touristType: "Adventure Travelers",

    provider: {
      "@type": "TravelAgency",
      name: settings.companyName || "Company",
      url: SITE_URL,
    },

    offers: {
      "@type": "Offer",

      price: tour.price,

      priceCurrency: tour.currency || "KES",

      availability: "https://schema.org/InStock",

      url: `${SITE_URL}/tours/${tour.slug || tour._id}`,
    },

    itinerary:
      tour.itinerary?.map((day) => ({
        "@type": "TouristAttraction",
        name:
          day.title ||
          day.name ||
          `Day ${day.day}`,
        description: day.description,
      })) || [],

    aggregateRating: tour.averageRating
      ? {
          "@type": "AggregateRating",
          ratingValue: tour.averageRating,
          reviewCount: tour.reviewCount || 1,
        }
      : undefined,
  };

  // Return the expression shown below to the caller.
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
