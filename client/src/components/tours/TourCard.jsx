import { useSettings } from "../../context/SettingsContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { addWishlist } from "../../api/wishlistApi";
import { getTourImage, TOUR_FALLBACK_IMAGES } from "../../utils/tourImage";

const NO_IMAGE = "/gallery/beach.jpg";

export default function TourCard({ tour }) {
  const { settings = {} } = useSettings() || {};
  const currency = settings.currency || tour.currency || "KES";
  const currencySymbolMap = { KES: "KSh", USD: "$", EUR: "€", GBP: "£" };
  const currencySymbol = currencySymbolMap[currency] || settings.currencySymbol || tour.currencySymbol || currency;
  const [adding, setAdding] = useState(false);
  const [imageSrc, setImageSrc] = useState(() => getTourImage(tour) || TOUR_FALLBACK_IMAGES[0] || NO_IMAGE);
  const [failedImageUrls, setFailedImageUrls] = useState(() => new Set());

  const price = Number(tour.price ?? 0);
  const calculatedDiscount = Number(tour.discount) > 0 ? price - (price * Number(tour.discount)) / 100 : price;
  const discountedPrice = Number(tour.finalPrice ?? tour.discountPrice ?? calculatedDiscount);
  const formatAmount = (value) => Number.isFinite(value) && value >= 0 ? `${currencySymbol} ${value.toLocaleString("en-KE", { maximumFractionDigits: 0 })}` : "Price on request";
  const hasDiscount = Number.isFinite(discountedPrice) && Number.isFinite(price) && discountedPrice < price;
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

  const handleImageError = () => {
    const failed = new Set(failedImageUrls);
    failed.add(imageSrc);

    const nextImage = TOUR_FALLBACK_IMAGES.find(
      (url) => url && !failed.has(url)
    );

    if (nextImage) {
      failed.add(nextImage);
      setFailedImageUrls(failed);
      setImageSrc(nextImage);
      return;
    }

    setImageSrc(NO_IMAGE);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="relative">
        <img src={imageSrc} alt={tourTitle} className="w-full h-64 object-cover" loading="lazy" onError={handleImageError} />
        {hasDiscount && <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">Discount</span>}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center gap-3">
          {destinationSlug ? (
            <Link to={`/destinations/${destinationSlug}`} className="text-sm text-green-700 font-medium hover:underline truncate">{destinationName}</Link>
          ) : (
            <span className="text-sm text-red-600 font-medium">Destination not assigned</span>
          )}
          {Number(rating?.average ?? rating) > 0 && <span className="shrink-0 text-yellow-600" aria-label={`Rating ${Number(rating?.average ?? rating).toFixed(1)} out of 5`}>★ {Number(rating?.average ?? rating).toFixed(1)}</span>}
        </div>

        <h2 className="text-xl font-bold mt-3">{tourTitle}</h2>
        {tour.description && <p className="mt-2 line-clamp-3 text-gray-600">{tour.description}</p>}

        <div className="mt-5 flex justify-between items-center">
          <div>
            {hasDiscount && <p className="text-gray-400 line-through">{formatAmount(price)}</p>}
            <p className="text-2xl font-bold text-green-700">{formatAmount(discountedPrice)}</p>
          </div>
          <Link to={`/tours/${tour.slug || tour._id}`} className="bg-yellow-600 text-white px-5 py-2 rounded-lg hover:bg-yellow-700 transition">View Trip</Link>
        </div>

        <button onClick={handleWishlist} disabled={adding} className="mt-3 w-full border border-green-600 text-green-700 py-2 rounded-lg hover:bg-green-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
          {adding ? "Adding..." : "♡ Add to Wishlist"}
        </button>
      </div>
    </div>
  );
}
