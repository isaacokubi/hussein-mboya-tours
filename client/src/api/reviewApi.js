import api from "./axios";

export const createReview = async (payload) => (await api.post("/reviews", payload)).data;

export const getTourReviews = async (tourId) => {
  if (!tourId) return { success: true, count: 0, reviews: [] };
  return (await api.get(`/reviews/tour/${tourId}`)).data;
};

export const getAdminReviews = async () => (await api.get("/admin/reviews")).data;
