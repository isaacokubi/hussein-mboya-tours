import { getTourImage } from "../utils/tourImage";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getTourBySlug } from "../api/tourApi";
import { MessageCircle, Star } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useTenant } from "../context/TenantContext";
import LazyImage from "../components/common/LazyImage";

const FALLBACK_TOUR_IMAGE = "/gallery/beach.jpg";

export default function TourDetails() {
  const { slug } = useParams();
  const { tenant } = useTenant();
  const { supportPhone, settings } = useSettings();
  const navigate = useNavigate();
  const tenantId = String(tenant?._id || tenant?.id || "").trim();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tour", tenantId || "public", slug],
    queryFn: () => getTourBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 0,
    refetchInterval: 15000,
  });

  const tour = data?.data || data;

  const { data: reviewsData } = useQuery({
    queryKey: ["tour-reviews", tenantId || "public", tour?._id],
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Loading tour details...
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-red-400">
        Tour not found.
      </div>
    );
  }

  const image = getTourImage(tour) || FALLBACK_TOUR_IMAGE;
  const availableSlots = tour.availableSlots ?? Math.max(
    Number(tour.totalSlots || tour.capacity || 0) - Number(tour.bookedSlots || 0),
    0
  );

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
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6">
      <div className="mx-auto grid max-w-7xl gap-10 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-8 md:grid-cols-2">
        <div>
          <LazyImage
            src={image}
            alt={tour.title || "Tour"}
            fallback={FALLBACK_TOUR_IMAGE}
            className="h-[500px] w-full rounded-2xl object-cover"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{tour.title}</h1>
          <p className="mt-5 leading-relaxed text-slate-300">{tour.description}</p>
          <div className="mt-6 text-4xl font-bold text-emerald-400">
            KES {Number(tour.price || 0).toLocaleString()}
          </div>

          <div className="mt-8 space-y-4 text-lg text-slate-200">
            <p>📍 <strong className="text-white">Destination:</strong> {tour.destination?.name || tour.destination || "N/A"}</p>
            <p>⏳ <strong className="text-white">Duration:</strong> {tour.duration || tour.durationDays || "N/A"}</p>
            <p>🏕️ <strong className="text-white">Category:</strong> {tour.category || "N/A"}</p>
            <p>👥 <strong className="text-white">Capacity:</strong> {tour.totalSlots ?? tour.capacity ?? tour.maxGuests ?? "N/A"}</p>
            <p>🎟️ <strong className="text-white">Booked Slots:</strong> {tour.bookedSlots ?? 0}</p>
            <p>🎟️ <strong className="text-white">Available Slots:</strong> {availableSlots}</p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button onClick={handleBooking} className="rounded-full bg-emerald-500 px-10 py-4 text-lg font-bold text-slate-950 hover:bg-emerald-400">
              Book This Adventure
            </button>
            <button onClick={handleWhatsAppBooking} className="inline-flex items-center gap-2 rounded-full bg-green-600 px-7 py-4 font-bold text-white hover:bg-green-500">
              <MessageCircle size={20} /> Book on WhatsApp
            </button>
          </div>
        </div>

        <section className="mt-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 md:col-span-2">
          <div className="flex items-center gap-2">
            <Star className="text-yellow-400" fill="currentColor" />
            <h2 className="text-2xl font-bold text-white">Customer Reviews</h2>
          </div>
          <p className="mt-1 text-slate-400">
            {reviews.length ? `${reviews.length} verified review${reviews.length === 1 ? "" : "s"}` : "No approved reviews yet."}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review._id} className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-white">{review.user?.name || "Traveler"}</strong>
                  <span className="text-yellow-400">{"★".repeat(Number(review.rating || 0))}</span>
                </div>
                {review.title && <h3 className="mt-2 font-semibold text-white">{review.title}</h3>}
                <p className="mt-2 text-slate-300">{review.comment}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
