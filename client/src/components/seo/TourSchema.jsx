import { Helmet } from "react-helmet-async";

const SITE_URL =
  import.meta.env.VITE_SITE_URL ||
  "https://www.husseinmboyatours.com";

export default function TourSchema({ tour }) {
  if (!tour) return null;

  const image =
    typeof tour.images?.[0] === "object"
      ? tour.images?.[0]?.url
      : tour.images?.[0];

  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",

    name: tour.title,

    description:
      tour.shortDescription ||
      tour.description,

    image: image
      ? image.startsWith("http")
        ? image
        : `${SITE_URL}${image}`
      : undefined,

    url: `${SITE_URL}/tours/${tour.slug || tour._id}`,

    touristType: "Adventure Travelers",

    provider: {
      "@type": "TravelAgency",
      name: "Hussein Mboya Tours",
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

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}