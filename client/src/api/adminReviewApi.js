/**
 * Purpose: admin Review Api client application module. Main declarations: getAdminReviews, approveReview, rejectReview, deleteReview.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getAdminReviews for use by the surrounding module or function.
export const getAdminReviews = async () => (await api.get("/admin/reviews")).data;
// Declare approveReview for use by the surrounding module or function.
export const approveReview = async (id) => (await api.patch(`/admin/reviews/${id}/approve`)).data;
// Declare rejectReview for use by the surrounding module or function.
export const rejectReview = async (id, reason = "") => (await api.patch(`/admin/reviews/${id}/reject`, { reason })).data;
// Declare deleteReview for use by the surrounding module or function.
export const deleteReview = async (id) => (await api.delete(`/admin/reviews/${id}`)).data;
