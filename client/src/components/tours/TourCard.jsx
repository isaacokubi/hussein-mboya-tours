/**
 * Purpose: Tour Card reusable UI component. Main declarations: TourCard, handleWishlist, handleImageError.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useSettings } from "../../context/SettingsContext";
// Load react-router-dom so this module can use its exported dependencies.
import { Link } from "react-router-dom";
// Load react so this module can use its exported dependencies.
import { useState } from "react";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../../api/wishlistApi so this module can use its exported dependencies.
import { addWishlist } from "../../api/wishlistApi";
// Load ../../utils/tourImage so this module can use its exported dependencies.
import { getTourImage, TOUR_FALLBACK_IMAGES } from "../../utils/tourImage";

// Declare NO_IMAGE for use by the surrounding module or function.
const NO_IMAGE = "/gallery/beach.jpg";

// Define TourCard; its parameters and body implement this operation.
export default function TourCard({ tour }) {
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare currency for use by the surrounding module or function.
  const currency = settings.currency || tour.currency || "KES";
  // Declare currencySymbolMap for use by the surrounding module or function.
  const currencySymbolMap = { KES: "KSh", USD: "$", EUR: "€", GBP: "£" };
  // Declare currencySymbol for use by the surrounding module or function.
  const currencySymbol = currencySymbolMap[currency] || settings.currencySymbol || tour.currencySymbol || currency;
  // Declare [adding, setAdding] for use by the surrounding module or function.
  const [adding, setAdding] = useState(false);
  // Declare [imageSrc, setImageSrc] for use by the surrounding module or function.
  const [imageSrc, setImageSrc] = useState(() => getTourImage(tour) || TOUR_FALLBACK_IMAGES[0] || NO_IMAGE);
  // Declare [failedImageUrls, setFailedImageUrls] for use by the surrounding module or function.
  const [failedImageUrls, setFailedImageUrls] = useState(() => new Set());

  // Declare price for use by the surrounding module or function.
  const price = Number(tour.price || 0);
  // Declare discountedPrice for use by the surrounding module or function.
  const discountedPrice = tour.discount ? price - (price * Number(tour.discount)) / 100 : price;
  // Declare tourTitle for use by the surrounding module or function.
  const tourTitle = tour.title || tour.name || "Amazing Safari Experience";
  // Declare destination for use by the surrounding module or function.
  const destination = tour.destination && typeof tour.destination === "object" ? tour.destination : null;
  // Declare destinationName for use by the surrounding module or function.
  const destinationName = destination?.name || tour.country || "Destination";
  // Declare destinationSlug for use by the surrounding module or function.
  const destinationSlug = destination?.slug || destination?._id;
  // Declare rating for use by the surrounding module or function.
  const rating = typeof tour.rating === "object" ? tour.rating?.average : (tour.rating ?? tour.averageRating ?? 0);

  // Declare handleWishlist for use by the surrounding module or function.
  const handleWishlist = async () => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      setAdding(true);
      // Perform the side effect or state update expressed on the following line.
      await addWishlist(tour._id);
      // Perform the side effect or state update expressed on the following line.
      toast.success("Added to wishlist ❤️");
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      console.error(error);
      // Perform the side effect or state update expressed on the following line.
      toast.error(error.response?.data?.message || "Failed to add wishlist");
    } finally {
      // Perform the side effect or state update expressed on the following line.
      setAdding(false);
    }
  };

  // Declare handleImageError for use by the surrounding module or function.
  const handleImageError = () => {
    // Declare failed for use by the surrounding module or function.
    const failed = new Set(failedImageUrls);
    // Perform the side effect or state update expressed on the following line.
    failed.add(imageSrc);

    // Declare nextImage for use by the surrounding module or function.
    const nextImage = TOUR_FALLBACK_IMAGES.find(
      (url) => url && !failed.has(url)
    );

    // Check the condition (nextImage) and run the matching branch.
    if (nextImage) {
      // Perform the side effect or state update expressed on the following line.
      failed.add(nextImage);
      // Perform the side effect or state update expressed on the following line.
      setFailedImageUrls(failed);
      // Perform the side effect or state update expressed on the following line.
      setImageSrc(nextImage);
      // Return the result to the caller.
      return;
    }

    // Perform the side effect or state update expressed on the following line.
    setImageSrc(NO_IMAGE);
  };

  // Return the expression shown below to the caller.
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
