import { getTourImage } from "../utils/tourImage";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getTourBySlug } from "../api/tourApi";
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
  const { data: reviewsData } = useQuery({
    queryKey: ["tour-reviews", tour?._id],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/reviews/tour/${tour._id}`);
      if (!response.ok) throw new Error("Failed to load reviews");
      return response.json();
    },
    enabled: Boolean(tour?._id),
  });
  const reviews = reviewsData?.reviews || [];

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading tour details...</div>;
  if (error || !tour) return <div className="min-h-screen flex items-center justify-center text-red-600">Tour not found.</div>;

  const image = getTourImage(tour);
  const handleBooking = () => navigate(`/checkout/tour/${tour._id}`);
  const handleWhatsAppBooking = () => {
    const message = encodeURIComponent(`Hello ${settings?.companyName || "Company"}, I would like to book "${tour.title}" on ${tour.date ? new Date(tour.date).toLocaleDateString("en-KE") : "the available date"}. Please share availability and booking details.`);
    const whatsappNumber = String(supportPhone || "+254733439362").replace(/\D/g, "").replace(/^0/, "254");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8 grid md:grid-cols-2 gap-10">
        <div><img src={image} alt={tour.title} className="w-full h-[500px] object-cover rounded-2xl" /></div>
        <div>
          <h1 className="text-4xl font-bold">{tour.title}</h1>
          <p className="mt-4 text-gray-600">{tour.description}</p>
          <div className="mt-6 flex gap-3"><button onClick={handleBooking} className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white">Book Now</button><button onClick={handleWhatsAppBooking} className="rounded-xl border px-6 py-3 font-semibold"><MessageCircle className="mr-2 inline" size={18} />WhatsApp</button></div>
          <div className="mt-8"><h2 className="text-xl font-bold">Reviews ({reviews.length})</h2>{reviews.length ? reviews.map((review) => <div key={review._id || review.id} className="mt-3 rounded-lg border p-4"><div><Star className="mr-1 inline" size={16} />{review.rating || 0}</div><p className="mt-1 text-gray-600">{review.comment || review.review || ""}</p></div>) : <p className="mt-3 text-gray-500">No reviews yet.</p>}</div>
        </div>
      </div>
    </div>
  );
}
