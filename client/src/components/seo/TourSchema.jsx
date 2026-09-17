import { useSettings } from "../../context/SettingsContext";
import { Helmet } from "react-helmet-async";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");

export default function TourSchema({ tour }) {
  const { settings = {} } = useSettings() || {};
  if (!tour) return null;

  const baseUrl = SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const image = typeof tour.images?.[0] === "object" ? tour.images?.[0]?.url : tour.images?.[0];
  const absoluteUrl = (value) => {
    if (!value) return undefined;
    return String(value).startsWith("http") ? value : `${baseUrl}${String(value).startsWith("/") ? "" : "/"}${value}`;
  };
  const tourUrl = `${baseUrl}/tours/${tour.slug || tour._id}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.shortDescription || tour.description,
    image: absoluteUrl(image),
    url: tourUrl,
    touristType: "Adventure Travelers",
    provider: {
      "@type": "TravelAgency",
      name: settings.companyName || "Global Tours",
      url: baseUrl,
    },
    offers: {
      "@type": "Offer",
      price: tour.price,
      priceCurrency: tour.currency || "KES",
      availability: "https://schema.org/InStock",
      url: tourUrl,
    },
    itinerary: tour.itinerary?.map((day) => ({
      "@type": "TouristAttraction",
      name: day.title || day.name || `Day ${day.day}`,
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

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
