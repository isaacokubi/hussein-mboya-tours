import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "react-toastify";

import api from "../../api/axios";

export default function ReviewForm({
  tourId,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  /*
  |--------------------------------------------------------------------------
  | UPDATE FIELD
  |--------------------------------------------------------------------------
  */

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT REVIEW
  |--------------------------------------------------------------------------
  */

  const submit = async (e) => {
    e.preventDefault();

    if (!form.comment.trim()) {
      toast.error("Please write your review.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/reviews", {
        tourId,
        rating: Number(form.rating),
        title: form.title.trim(),
        comment: form.comment.trim(),
      });

      toast.success("Thank you for your review!");

      setForm({
        rating: 5,
        title: "",
        comment: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to submit review."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="
      bg-white
      rounded-2xl
      shadow-lg
      p-6
      space-y-6
      "
    >
      <h2 className="text-2xl font-bold">
        Share Your Experience
      </h2>

      <p className="text-gray-500">
        Tell other travelers about your trip.
      </p>

      {/* Rating */}

      <div>
        <label className="block font-medium mb-3">
          Rating
        </label>

        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                updateField("rating", star)
              }
              className="transition hover:scale-110"
            >
              <Star
                size={32}
                className={
                  star <= form.rating
                    ? "text-yellow-500"
                    : "text-gray-300"
                }
                fill={
                  star <= form.rating
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}

      <div>
        <label className="block font-medium mb-2">
          Review Title
        </label>

        <input
          type="text"
          value={form.title}
          onChange={(e) =>
            updateField("title", e.target.value)
          }
          placeholder="Amazing safari experience..."
          className="
          w-full
          border
          rounded-lg
          p-3
          focus:ring-2
          focus:ring-green-600
          focus:outline-none
          "
        />
      </div>

      {/* Comment */}

      <div>
        <label className="block font-medium mb-2">
          Review
        </label>

        <textarea
          rows={5}
          value={form.comment}
          onChange={(e) =>
            updateField("comment", e.target.value)
          }
          placeholder="Share your experience with other travelers..."
          className="
          w-full
          border
          rounded-lg
          p-3
          resize-none
          focus:ring-2
          focus:ring-green-600
          focus:outline-none
          "
        />
      </div>

      {/* Submit */}

      <button
        type="submit"
        disabled={loading}
        className="
        w-full
        bg-green-700
        hover:bg-green-800
        disabled:bg-green-400
        text-white
        py-3
        rounded-xl
        font-semibold
        transition
        "
      >
        {loading
          ? "Submitting..."
          : "Submit Review"}
      </button>
    </form>
  );
}