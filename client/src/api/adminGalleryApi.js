/**
 * Purpose: admin Gallery Api client application module. Main declarations: unwrapList, getAdminGallery, createGallery, updateGallery, deleteGallery.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare unwrapList for use by the surrounding module or function.
const unwrapList = (data, keys = []) => {
  // Check the condition (Array.isArray(data)) and run the matching branch.
  if (Array.isArray(data)) return data;
  // Repeat the enclosed work for each required iteration.
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  // Check the condition (Array.isArray(data?.data)) and run the matching branch.
  if (Array.isArray(data?.data)) return data.data;
  // Return the collection assembled below to the caller.
  return [];
};

// Declare getAdminGallery for use by the surrounding module or function.
export const getAdminGallery = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/gallery");
  // Return the result of unwrapList() to the caller.
  return unwrapList(data, ["gallery", "images"]);
};

// Declare createGallery for use by the surrounding module or function.
export const createGallery = async (payload) => (await api.post("/admin/gallery", payload)).data;
// Declare updateGallery for use by the surrounding module or function.
export const updateGallery = async (id, payload) => (await api.put(`/admin/gallery/${id}`, payload)).data;
// Declare deleteGallery for use by the surrounding module or function.
export const deleteGallery = async (id) => (await api.delete(`/admin/gallery/${id}`)).data;
