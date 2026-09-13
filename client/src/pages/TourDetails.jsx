import { getTourImage } from "../utils/tourImage";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getTourBySlug } from "../api/tourApi";
import { getTourReviews } from "../api/reviewApi";
import { MessageCircle, Star } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function TourDetails() {
  const { slug } = useParams();
  const { supportPhone, settings } = useSettings();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tour", slug],
    queryFn: () => getTourBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 0,
    refetchInterval: 15000,
  });

  const tour = data?.data || data;

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ["tour-reviews", tour?._id],
    queryFn: () => getTourReviews(tour?._id),
    enabled: Boolean(tour?._id),
    staleTime: 30000,
    retry: 1,
  });

  const reviews = Array.isArray(reviewsData?.reviews)
    ? reviewsData.reviews
    : Array.isArray(reviewsData)
      ? reviewsData
      : [];

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading tour details...</div>;
  }

  if (error || !tour) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Tour not found.</div>;
  }

  const image = getTourImage(tour);

  const handleBooking = () => navigate(`/checkout/tour/${tour._id}`);

  const handleWhatsAppBooking = () => {
    const message = encodeURIComponent(
      `Hello ${settings?.companyName || "Company"}, I would like to book "${tour.title}" on ${tour.date ? new Date(tour.date).toLocaleDateString("en-KE") : "the available date"}. Please share availability and booking details.`
    );
    const whatsappNumber = String(supportPhone || "+254733439362")
      .replace(/\D/g, "")
      .replace(/^0/, "254");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8 grid md:grid-cols-2 gap-10">
        <div>
          <img src={image} alt={tour.title} className="w-full h-[500px] object-cover rounded-2xl" />
        </div>
        <div>
          <h1 className="text-5xl font-bold text-green-900">{tour.title}</h1>
          <p className="mt-5 text-gray-600 leading-relaxed">{tour.description}</p>
          <div className="mt-6 text-4xl font-bold text-green-700">KES {Number(tour.price || 0).toLocaleString()}</div>
          <div className="mt-8 space-y-4 text-lg">
            <p>📍 <strong>Destination:</strong> {tour.destination?.name || tour.destination || "N/A"}</p>
            <p>⏳ <strong>Duration:</strong> {tour.duration || tour.durationDays || "N/A"}</p>
            <p>🏕️ <strong>Category:</strong> {tour.category || "N/A"}</p>
            <p>👥 <strong>Capacity:</strong> {tour.totalSlots ?? tour.capacity ?? tour.maxGuests ?? "N/A"}</p>
            <p>🎟️ <strong>Booked Slots:</strong> {tour.bookedSlots ?? 0}</p>
            <p>🎟️ <strong>Available Slots:</strong> {tour.availableSlots ?? Math.max((tour.totalSlots || tour.capacity || 0) - (tour.bookedSlots || 0), 0)}</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <button onClick={handleBooking} className="bg-green-700 hover:bg-green-800 text-white px-10 py-4 rounded-full font-bold text-lg">Book This Adventure</button>
            <button onClick={handleWhatsAppBooking} className="inline-flex items-center gap-2 rounded-full bg-green-600 px-7 py-4 font-bold text-white"><MessageCircle size={20} />Book on WhatsApp</button>
          </div>
        </div>

        <section className="md:col-span-2 mt-2 rounded-2xl bg-gray-50 p-6">
          <div className="flex items-center gap-2">
            <Star className="text-yellow-500" fill="currentColor" />
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
          </div>

          {reviewsLoading ? (
            <p className="mt-3 text-gray-500">Loading customer reviews...</p>
          ) : reviewsError ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-red-600">Unable to load reviews.</p>
              <button onClick={() => refetchReviews()} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800">
                Retry
              </button>
            </div>
          ) : (
            <>
              <p className="mt-1 text-gray-500">
                {reviews.length
                  ? `${reviews.length} approved review${reviews.length === 1 ? "" : "s"}`
                  : "No approved reviews yet."}
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {reviews.map((review) => {
                  const stars = Math.max(0, Math.min(5, Number(review.rating) || 0));
                  return (
                    <article key={review._id} className="rounded-xl bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <strong>{review.user?.name || review.customer?.name || "Traveler"}</strong>
                        <span className="text-yellow-500" aria-label={`${stars} out of 5 stars`}>
                          {"★".repeat(stars)}{"☆".repeat(5 - stars)}
                        </span>
                      </div>
                      {review.title && <h3 className="mt-2 font-semibold">{review.title}</h3>}
                      <p className="mt-2 text-gray-600">{review.comment || "No comment provided."}</p>
                      {review.verified && <span className="mt-3 inline-block text-xs font-semibold text-sky-700">Verified customer</span>}
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
