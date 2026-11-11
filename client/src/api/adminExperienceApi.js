/**
 * Purpose: admin Experience Api client application module. Main declarations: getAdminExperiences, createExperience, updateExperience, deleteExperience.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Define getAdminExperiences; its parameters and body implement this operation.
export async function getAdminExperiences() {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/experiences");
  // Return the expression shown below to the caller.
  return data?.categories || data?.experiences || [];
}

// Define createExperience; its parameters and body implement this operation.
export async function createExperience(payload) {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post("/admin/experiences", payload);
  // Return the expression shown below to the caller.
  return data?.category || data?.experience;
}

// Define updateExperience; its parameters and body implement this operation.
export async function updateExperience(id, payload) {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/admin/experiences/${id}`, payload);
  // Return the expression shown below to the caller.
  return data?.category || data?.experience;
}

// Define deleteExperience; its parameters and body implement this operation.
export async function deleteExperience(id) {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(`/admin/experiences/${id}`);
  // Return the value of data to the caller.
  return data;
}
