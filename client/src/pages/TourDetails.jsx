import { getTourImage } from "../utils/tourImage";
import { useQuery } from "@tanstack/react-query";

import { useParams, useNavigate } from "react-router-dom";

import { getTourBySlug } from "../api/tourApi";
import { useQuery as useReviewsQuery } from "@tanstack/react-query";
import { MessageCircle, Star } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function TourDetails(
) {
 const { slug } = useParams();
  const { supportPhone } = useSettings();

  const navigate = useNavigate();

  const {
    data,

    isLoading,

    error,
  } = useQuery({
    queryKey: ["tour", slug],

    queryFn: () => getTourBySlug(slug),

    enabled: Boolean(slug),
    staleTime: 0,
    refetchInterval: 15000,
  });

  /*
  |--------------------------------------------------------------------------
  | FIX RESPONSE STRUCTURE
  |--------------------------------------------------------------------------
  */

  const tour = data?.data || data;

  const { data: reviewsData } = useReviewsQuery({
    queryKey: ["tour-reviews", tour?._id],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "/api"}/reviews/tour/${tour._id}`
      );
      if (!response.ok) throw new Error("Failed to load reviews");
      return response.json();
    },
    enabled: Boolean(tour?._id),
  });

  const reviews = reviewsData?.reviews || [];

  if (isLoading) {
    return (
      <div
        className="
      min-h-screen
      flex
      items-center
      justify-center
      "
      >
        Loading tour details...
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div
        className="
      min-h-screen
      flex
      items-center
      justify-center
      text-red-600
      "
      >
        Tour not found.
      </div>
    );
  }

  const image = getTourImage(tour);

  const handleBooking = () => {
    navigate(`/checkout/${tour._id}`);
  };

  const handleWhatsAppBooking = () => {
    const message = encodeURIComponent(
      `Hello Coherent Tours, I would like to book "${tour.title}" on ${tour.date ? new Date(tour.date).toLocaleDateString("en-KE") : "the available date"}. Please share availability and booking details.`
    );
    const whatsappNumber = String(supportPhone || "+254733439362").replace(/\D/g, "").replace(/^0/, "254");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="
    min-h-screen
    bg-gray-100
    p-6
    "
    >
      <div
        className="
      max-w-7xl
      mx-auto
      bg-white
      rounded-3xl
      shadow-xl
      p-8
      grid
      md:grid-cols-2
      gap-10
      "
      >
        {/* IMAGE */}

        <div>
          <img
            src={image}
            alt={tour.title}
            className="
          w-full
          h-[500px]
          object-cover
          rounded-2xl
          "
          />
        </div>

        {/* DETAILS */}

        <div>
          <h1
            className="
          text-5xl
          font-bold
          text-green-900
          "
          >
            {tour.title}
          </h1>

          <p
            className="
          mt-5
          text-gray-600
          leading-relaxed
          "
          >
            {tour.description}
          </p>

          <div
            className="
          mt-6
          text-4xl
          font-bold
          text-green-700
          "
          >
            KES {Number(tour.price || 0).toLocaleString()}
          </div>

          <div
            className="
          mt-8
          space-y-4
          text-lg
          "
          >
            <p>
              📍
              <strong>Destination:</strong>{" "}
              {tour.destination?.name || tour.destination || "N/A"}
            </p>

            <p>
              ⏳<strong>Duration:</strong>{" "}
              {tour.duration || tour.durationDays || "N/A"}
            </p>

            <p>
              🏕️
              <strong>Category:</strong> {tour.category || "N/A"}
            </p>

            <p>
              👥
              <strong>Capacity:</strong>{" "}
              {tour.totalSlots ?? tour.capacity ?? tour.maxGuests ?? "N/A"}
            </p>

            <p>
              🎟️
              <strong>Booked Slots:</strong>{" "}
              {tour.bookedSlots ?? 0}
            </p>

            <p>
              🎟️
              <strong>Available Slots:</strong>{" "}
              {tour.availableSlots ?? Math.max((tour.totalSlots || tour.capacity || 0) - (tour.bookedSlots || 0), 0)}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={handleBooking}
            className="
          mt-10
          bg-green-700
          hover:bg-green-800
          text-white
          px-10
          py-4
          rounded-full
          font-bold
          text-lg
          "
          >
            Book This Adventure
          </button>

          <button
            onClick={handleWhatsAppBooking}
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-7 py-4 font-bold text-white"
          >
            <MessageCircle size={20} />
            Book on WhatsApp
          </button>
          </div>
        </div>

        <section className="md:col-span-2 mt-2 rounded-2xl bg-gray-50 p-6">
          <div className="flex items-center gap-2">
            <Star className="text-yellow-500" fill="currentColor" />
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
          </div>
          <p className="mt-1 text-gray-500">
            {reviews.length ? `${reviews.length} verified review${reviews.length === 1 ? "" : "s"}` : "No approved reviews yet."}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review._id} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <strong>{review.user?.name || "Traveler"}</strong>
                  <span className="text-yellow-500">{"★".repeat(Number(review.rating || 0))}</span>
                </div>
                {review.title && <h3 className="mt-2 font-semibold">{review.title}</h3>}
                <p className="mt-2 text-gray-600">{review.comment}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
