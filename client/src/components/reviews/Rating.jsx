import { Star } from "lucide-react";

export default function Rating({
  value = 0,
  reviews,
  showValue = false,
  size = 18,
}) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <div
      className="flex items-center gap-2"
      aria-label={`Rated ${rating} out of 5`}
    >
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half =
            rating >= star - 0.5 &&
            rating < star;

          return (
            <div
              key={star}
              className="relative"
            >
              {/* Empty Star */}

              <Star
                size={size}
                className="text-gray-300"
                fill="none"
              />

              {/* Filled / Half Filled */}

              {(filled || half) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    width: filled ? "100%" : "50%",
                  }}
                >
                  <Star
                    size={size}
                    className="text-yellow-500"
                    fill="currentColor"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}

      {typeof reviews === "number" && (
        <span className="text-sm text-gray-500">
          ({reviews.toLocaleString()} reviews)
        </span>
      )}
    </div>
  );
}