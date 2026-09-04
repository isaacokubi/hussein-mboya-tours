import { useSettings } from "../../context/SettingsContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { addWishlist } from "../../api/wishlistApi";
import LazyImage from "../common/LazyImage";
import { getTourImage, TOUR_FALLBACK_IMAGES } from "../../utils/tourImage";

const NO_IMAGE = "/gallery/beach.jpg";

export default function TourCard({ tour = {} }) {
  const { settings = {} } = useSettings() || {};
  const currency = settings.currency || tour.currency || "KES";
  const currencySymbolMap = { KES: "KSh", USD: "$", EUR: "€", GBP: "£" };
  const currencySymbol = currencySymbolMap[currency] || settings.currencySymbol || tour.currencySymbol || currency;
  const [adding, setAdding] = useState(false);
  const [imageSrc] = useState(() => getTourImage(tour) || TOUR_FALLBACK_IMAGES[0] || NO_IMAGE);

  const price = Number(tour.price || 0);
  const discountedPrice = tour.discount ? price - (price * Number(tour.discount)) / 100 : price;
  const tourTitle = tour.title || tour.name || "Amazing Safari Experience";
  const destination = tour.destination && typeof tour.destination === "object" ? tour.destination : null;
  const destinationName = destination?.name || tour.country || "Destination";
  const destinationSlug = destination?.slug || destination?._id;
  const rating = typeof tour.rating === "object" ? tour.rating?.average : (tour.rating ?? tour.averageRating ?? 0);

  const handleWishlist = async () => {
    try {
      setAdding(true);
      await addWishlist(tour._id);
      toast.success("Added to wishlist ❤️");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add wishlist");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
      <div className="relative overflow-hidden bg-slate-800">
        <LazyImage
          src={imageSrc}
          alt={tourTitle}
          fallback={TOUR_FALLBACK_IMAGES[0] || NO_IMAGE}
          className="h-64 w-full object-cover"
        />
        {Number(tour.discount) > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
            {tour.discount}% OFF
          </span>
        )}
      </div>

      <div className="p-6 text-slate-100">
        <div className="flex items-center justify-between gap-3">
          {destinationSlug ? (
            <Link to={`/destinations/${destinationSlug}`} className="truncate text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:underline">
              {destinationName}
            </Link>
          ) : (
            <span className="text-sm font-medium text-red-400">Destination not assigned</span>
          )}
          <span className="shrink-0 text-yellow-400">⭐ {rating || 0}</span>
        </div>

        <h2 className="mt-3 text-xl font-bold text-white">{tourTitle}</h2>
        <p className="mt-2 line-clamp-3 text-slate-300">
          {tour.description || "Explore unforgettable destinations with our guided travel experience."}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <div>
            {Number(tour.discount) > 0 && <p className="text-slate-500 line-through">{currencySymbol} {price.toLocaleString("en-US")}</p>}
            <p className="text-2xl font-bold text-emerald-400">{currencySymbol} {discountedPrice.toLocaleString("en-US")}</p>
          </div>
          <Link to={`/tours/${tour.slug || tour._id}`} className="rounded-lg bg-yellow-500 px-5 py-2 font-semibold text-slate-950 transition hover:bg-yellow-400">
            View Trip
          </Link>
        </div>

        <button onClick={handleWishlist} disabled={adding} className="mt-3 w-full rounded-lg border border-emerald-500 py-2 text-emerald-400 transition hover:bg-emerald-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
          {adding ? "Adding..." : "♡ Add to Wishlist"}
        </button>
      </div>
    </div>
  );
}
