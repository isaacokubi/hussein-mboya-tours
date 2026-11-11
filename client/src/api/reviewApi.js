/**
 * Purpose: review Api client application module. Main declarations: createReview, getTourReviews, getAdminReviews.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare createReview for use by the surrounding module or function.
export const createReview = async (payload) => (await api.post("/reviews", payload)).data;

// Declare getTourReviews for use by the surrounding module or function.
export const getTourReviews = async (tourId) => {
  // Check the condition (!tourId) and run the matching branch.
  if (!tourId) return { success: true, count: 0, reviews: [] };
  // Return the data value to the caller.
  return (await api.get(`/reviews/tour/${tourId}`)).data;
};

// Declare getAdminReviews for use by the surrounding module or function.
export const getAdminReviews = async () => (await api.get("/admin/reviews")).data;
