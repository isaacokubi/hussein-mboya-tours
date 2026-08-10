import api from "./axios";

export const getAdminReviews = async () => (await api.get("/admin/reviews")).data;
export const approveReview = async (id) => (await api.patch(`/admin/reviews/${id}/approve`)).data;
export const rejectReview = async (id, reason = "") => (await api.patch(`/admin/reviews/${id}/reject`, { reason })).data;
export const deleteReview = async (id) => (await api.delete(`/admin/reviews/${id}`)).data;
