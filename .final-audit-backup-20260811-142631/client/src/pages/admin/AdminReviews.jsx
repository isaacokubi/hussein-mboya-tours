import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminReviews, approveReview, rejectReview, deleteReview } from "../../api/adminReviewApi";

export default function AdminReviews() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: getAdminReviews,
  });
  const reviews = data?.reviews || data?.data || [];

  const mutation = useMutation({
    mutationFn: ({ action, id }) => action === "approve" ? approveReview(id) : action === "reject" ? rejectReview(id) : deleteReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  if (isLoading) return <div className="p-6">Loading reviews...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load reviews.</div>;

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-3xl font-bold">Review Moderation</h1>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-xl shadow p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="font-semibold">{review.title || "Customer review"}</h2>
                <p className="text-sm text-gray-500">{review.user?.name || "Customer"} · {review.tour?.title || "Tour"}</p>
              </div>
              <span className="font-bold">{review.rating}/5</span>
            </div>
            <p className="mt-3 text-gray-700">{review.comment}</p>
            <p className="mt-2 text-sm">{review.approved ? "Approved" : review.rejected ? "Rejected" : "Pending moderation"}</p>
            <div className="flex gap-2 mt-4">
              {!review.approved && <button onClick={() => mutation.mutate({ action: "approve", id: review._id })} className="px-3 py-2 rounded bg-green-600 text-white">Approve</button>}
              {!review.rejected && <button onClick={() => mutation.mutate({ action: "reject", id: review._id })} className="px-3 py-2 rounded bg-yellow-600 text-white">Reject</button>}
              <button onClick={() => mutation.mutate({ action: "delete", id: review._id })} className="px-3 py-2 rounded bg-red-600 text-white">Delete</button>
            </div>
          </div>
        ))}
        {!reviews.length && <p className="text-gray-500">No reviews found.</p>}
      </div>
    </div>
  );
}
