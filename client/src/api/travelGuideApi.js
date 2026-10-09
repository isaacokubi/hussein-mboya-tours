import api from "./axios";

export async function getPublicTravelGuides(params = {}) {
  const { data } = await api.get("/travel-guides", { params });
  return Array.isArray(data?.guides) ? data.guides : [];
}

export async function getPublicTravelGuide(slug) {
  const { data } = await api.get(`/travel-guides/${encodeURIComponent(slug)}`);
  return data?.guide || null;
}

export async function getAdminTravelGuides() {
  const { data } = await api.get("/admin/travel-guides");
  return Array.isArray(data?.guides) ? data.guides : [];
}

export async function createTravelGuide(payload) {
  const { data } = await api.post("/admin/travel-guides", payload);
  return data?.guide;
}

export async function updateTravelGuide(id, payload) {
  const { data } = await api.put(`/admin/travel-guides/${encodeURIComponent(id)}`, payload);
  return data?.guide;
}

export async function deleteTravelGuide(id) {
  const { data } = await api.delete(`/admin/travel-guides/${encodeURIComponent(id)}`);
  return data;
}
