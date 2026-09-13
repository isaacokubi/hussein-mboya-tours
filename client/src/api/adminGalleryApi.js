import api from "./axios";

const unwrapList = (data, keys = []) => {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const getAdminGallery = async () => {
  const { data } = await api.get("/admin/gallery");
  return unwrapList(data, ["gallery", "images"]);
};

export const createGallery = async (payload) => (await api.post("/admin/gallery", payload)).data;
export const updateGallery = async (id, payload) => (await api.put(`/admin/gallery/${id}`, payload)).data;
export const deleteGallery = async (id) => (await api.delete(`/admin/gallery/${id}`)).data;
