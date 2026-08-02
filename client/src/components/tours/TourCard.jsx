// client/src/components/tours/TourCard.jsx

import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

import { addWishlist } from "../../api/wishlistApi";

export default function TourCard({ tour }) {
  const [adding, setAdding] = useState(false);

  const price = Number(tour.price || 0);

  const discountedPrice = tour.discount
    ? price - (price * Number(tour.discount)) / 100
    : price;

  const tourImage =
    typeof tour.images?.[0] === "object"
      ? tour.images?.[0]?.url
      : tour.images?.[0] ||
        tour.image ||
        "/placeholder.jpg";

  const tourTitle =
    tour.title ||
    tour.name ||
    "Amazing Safari Experience";

  const rating =
    typeof tour.rating === "object"
      ? tour.rating?.average
      : tour.rating;

  const handleWishlist = async () => {
    try {
      setAdding(true);

      await addWishlist(tour._id);

      toast.success("Added to wishlist ❤️");

    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to add wishlist"
      );

    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className="
      bg-white
      rounded-2xl
      shadow-lg
      overflow-hidden
      hover:shadow-xl
      transition
      "
    >
      <div className="relative">
        <img
          src={tourImage}
          alt={tourTitle}
          className="
          w-full
          h-64
          object-cover
          "
          onError={(e) => {
            e.currentTarget.src =
              "/placeholder.jpg";
          }}
        />

        {Number(tour.discount) > 0 && (
          <span
            className="
            absolute
            top-4
            left-4
            bg-red-600
            text-white
            px-3
            py-1
            rounded-full
            text-sm
            font-semibold
            "
          >
            {tour.discount}% OFF
          </span>
        )}
      </div>

      <div className="p-6">
        <div
          className="
          flex
          justify-between
          items-center
          "
        >
          <span
            className="
            text-sm
            text-gray-500
            "
          >
            {tour.country ||
              tour.destination?.name ||
              "Kenya"}
          </span>

          <span
            className="
            text-yellow-600
            "
          >
            ⭐ {rating || 0}
          </span>
        </div>

        <h2
          className="
          text-xl
          font-bold
          mt-3
          "
        >
          {tourTitle}
        </h2>

        <p
          className="
          text-gray-600
          mt-2
          line-clamp-3
          "
        >
          {tour.description ||
            "Explore unforgettable destinations with our guided travel experience."}
        </p>

        <div
          className="
          mt-5
          flex
          justify-between
          items-center
          "
        >
          <div>
            {Number(tour.discount) > 0 && (
              <p
                className="
                text-gray-400
                line-through
                "
              >
                KES{" "}
                {price.toLocaleString("en-US")}
              </p>
            )}

            <p
              className="
              text-2xl
              font-bold
              text-green-700
              "
            >
              KES{" "}
              {discountedPrice.toLocaleString("en-US")}
            </p>
          </div>

          <Link
            to={`/tours/${tour.slug || tour._id}`}
            className="
            bg-yellow-600
            text-white
            px-5
            py-2
            rounded-lg
            hover:bg-yellow-700
            transition
            "
          >
            View Trip
          </Link>
        </div>

        <button
          onClick={handleWishlist}
          disabled={adding}
          className="
          mt-3
          w-full
          border
          border-green-600
          text-green-700
          py-2
          rounded-lg
          hover:bg-green-600
          hover:text-white
          transition
          disabled:opacity-50
          disabled:cursor-not-allowed
          "
        >
          {adding
            ? "Adding..."
            : "♡ Add to Wishlist"}
        </button>
      </div>
    </div>
  );
}