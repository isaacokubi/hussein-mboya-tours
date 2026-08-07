import { ThumbsUp, CalendarDays, User } from "lucide-react";

import Rating from "./Rating";

export default function ReviewCard({ review = {} }) {
  const user = review.user || {};

  const name = user.name || "Anonymous Traveler";

  const avatar = user.avatar;

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString()
    : null;

  return (
    <div
      className="
      bg-white
      rounded-2xl
      shadow-md
      hover:shadow-xl
      transition
      duration-300
      p-6
      "
    >
      {/* Reviewer */}

      <div className="flex items-center gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="
            h-14
            w-14
            rounded-full
            object-cover
            "
          />
        ) : (
          <div
            className="
            h-14
            w-14
            rounded-full
            bg-green-700
            text-white
            flex
            items-center
            justify-center
            font-bold
            text-lg
            "
          >
            {initials || <User size={20} />}
          </div>
        )}

        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {name}
          </h3>

          {date && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <CalendarDays size={14} />

              {date}
            </div>
          )}
        </div>
      </div>

      {/* Rating */}

      <div className="mt-4">
        <Rating
          value={review.rating || 0}
          showValue
        />
      </div>

      {/* Title */}

      {review.title && (
        <h4 className="mt-4 text-lg font-bold text-gray-800">
          {review.title}
        </h4>
      )}

      {/* Comment */}

      <p className="mt-3 text-gray-600 leading-relaxed">
        {review.comment || "No review provided."}
      </p>

      {/* Footer */}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          className="
          flex
          items-center
          gap-2
          px-4
          py-2
          rounded-lg
          bg-gray-100
          hover:bg-green-100
          hover:text-green-700
          transition
          "
        >
          <ThumbsUp size={18} />

          Helpful

          <span className="font-semibold">
            ({review.helpfulVotes || 0})
          </span>
        </button>

        {review.verified && (
          <span
            className="
            text-sm
            font-medium
            text-green-700
            bg-green-100
            px-3
            py-1
            rounded-full
            "
          >
            Verified Traveler
          </span>
        )}
      </div>
    </div>
  );
}