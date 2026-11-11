/**
 * Purpose: Review Form reusable UI component. Main declarations: ReviewForm, updateField, submit.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";
// Load lucide-react so this module can use its exported dependencies.
import { Star } from "lucide-react";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";

// Load ../../api/axios so this module can use its exported dependencies.
import api from "../../api/axios";

// Define ReviewForm; its parameters and body implement this operation.
export default function ReviewForm({
  tourId,
  onSuccess,
}) {
  // Declare [loading, setLoading] for use by the surrounding module or function.
  const [loading, setLoading] = useState(false);

  // Declare [form, setForm] for use by the surrounding module or function.
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

  // Declare updateField for use by the surrounding module or function.
  const updateField = (field, value) => {
    // Perform the side effect or state update expressed on the following line.
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

  // Declare submit for use by the surrounding module or function.
  const submit = async (e) => {
    // Perform the side effect or state update expressed on the following line.
    e.preventDefault();

    // Check the condition (!form.comment.trim()) and run the matching branch.
    if (!form.comment.trim()) {
      // Perform the side effect or state update expressed on the following line.
      toast.error("Please write your review.");
      // Return the result to the caller.
      return;
    }

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      setLoading(true);

      // Perform the side effect or state update expressed on the following line.
      await api.post("/reviews", {
        tour: tourId,
        rating: Number(form.rating),
        title: form.title.trim(),
        comment: form.comment.trim(),
      });

      // Perform the side effect or state update expressed on the following line.
      toast.success("Thank you for your review!");

      // Perform the side effect or state update expressed on the following line.
      setForm({
        rating: 5,
        title: "",
        comment: "",
      });

      // Check the condition (onSuccess) and run the matching branch.
      if (onSuccess) {
        // Perform the side effect or state update expressed on the following line.
        onSuccess();
      }
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      toast.error(
        error.response?.data?.message ||
          "Unable to submit review."
      );
    } finally {
      // Perform the side effect or state update expressed on the following line.
      setLoading(false);
    }
  };

  // Return the expression shown below to the caller.
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
