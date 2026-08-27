import { useSettings } from "../../context/SettingsContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { addWishlist } from "../../api/wishlistApi";
import { getTourImage } from "../../utils/tourImage";

const NO_IMAGE = "/images/image-placeholder.jpg";

export default function TourCard({ tour }) {
  const { settings = {} } = useSettings() || {};
  const currency = settings.currency || tour.currency || "KES";
  const currencySymbolMap = { KES: "KSh", USD: "$", EUR: "€", GBP: "£" };
  const currencySymbol = currencySymbolMap[currency] || settings.currencySymbol || tour.currencySymbol || currency;
  const [adding, setAdding] = useState(false);
  const [imageSrc, setImageSrc] = useState(() => getTourImage(tour) || NO_IMAGE);

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

  const handleImageError = () => setImageSrc(NO_IMAGE);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="relative">
        <img src={imageSrc} alt={tourTitle} className="w-full h-64 object-cover" loading="lazy" onError={handleImageError} />
        {Number(tour.discount) > 0 && <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">{tour.discount}% OFF</span>}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center gap-3">
          {destinationSlug ? (
            <Link to={`/destinations/${destinationSlug}`} className="text-sm text-green-700 font-medium hover:underline truncate">{destinationName}</Link>
          ) : (
            <span className="text-sm text-red-600 font-medium">Destination not assigned</span>
          )}
          <span className="text-yellow-600 shrink-0">⭐ {rating || 0}</span>
        </div>

        <h2 className="text-xl font-bold mt-3">{tourTitle}</h2>
        <p className="text-gray-600 mt-2 line-clamp-3">{tour.description || "Explore unforgettable destinations with our guided travel experience."}</p>

        <div className="mt-5 flex justify-between items-center">
          <div>
            {Number(tour.discount) > 0 && <p className="text-gray-400 line-through">{currencySymbol} {price.toLocaleString("en-US")}</p>}
            <p className="text-2xl font-bold text-green-700">{currencySymbol} {discountedPrice.toLocaleString("en-US")}</p>
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
