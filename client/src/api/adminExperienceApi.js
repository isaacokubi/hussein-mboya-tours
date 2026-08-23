import api from "./axios";

export async function getAdminExperiences() {
  const { data } = await api.get("/admin/experiences");
  return data?.categories || data?.experiences || [];
}

export async function createExperience(payload) {
  const { data } = await api.post("/admin/experiences", payload);
  return data?.category || data?.experience;
}

export async function updateExperience(id, payload) {
  const { data } = await api.put(`/admin/experiences/${id}`, payload);
  return data?.category || data?.experience;
}

export async function deleteExperience(id) {
  const { data } = await api.delete(`/admin/experiences/${id}`);
  return data;
}
