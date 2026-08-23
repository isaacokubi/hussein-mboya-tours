import api from "./axios";

export const getAdminHeroSlides = async () => (await api.get("/admin/hero")).data;
export const createAdminHeroSlide = async (payload) => (await api.post("/admin/hero", payload)).data;
export const updateAdminHeroSlide = async ({ id, ...payload }) => (await api.put(`/admin/hero/${id}`, payload)).data;
export const deleteAdminHeroSlide = async (id) => (await api.delete(`/admin/hero/${id}`)).data;
