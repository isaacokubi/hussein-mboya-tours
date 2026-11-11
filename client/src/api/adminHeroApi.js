/**
 * Purpose: admin Hero Api client application module. Main declarations: getAdminHeroSlides, createAdminHeroSlide, updateAdminHeroSlide, deleteAdminHeroSlide.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getAdminHeroSlides for use by the surrounding module or function.
export const getAdminHeroSlides = async () => (await api.get("/admin/hero")).data;
// Declare createAdminHeroSlide for use by the surrounding module or function.
export const createAdminHeroSlide = async (payload) => (await api.post("/admin/hero", payload)).data;
// Declare updateAdminHeroSlide for use by the surrounding module or function.
export const updateAdminHeroSlide = async ({ id, ...payload }) => (await api.put(`/admin/hero/${id}`, payload)).data;
// Declare deleteAdminHeroSlide for use by the surrounding module or function.
export const deleteAdminHeroSlide = async (id) => (await api.delete(`/admin/hero/${id}`)).data;
