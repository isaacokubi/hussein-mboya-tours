import api from "./axios";

export const getTours = async (params = {}) => {
  const { data } = await api.get("/tourmanager/tours", { params });
  return Array.isArray(data?.tours) ? data.tours : Array.isArray(data?.data) ? data.data : [];
};

export const getGuides = async () => {
  const { data } = await api.get("/tourmanager/guides");
  return Array.isArray(data?.data) ? data.data : Array.isArray(data?.guides) ? data.guides : [];
};

export const getDrivers = async () => {
  const { data } = await api.get("/tourmanager/guides", { params: { role: "driver" } });
  return Array.isArray(data?.data) ? data.data.filter((staff) => String(staff.position || "").toLowerCase() === "driver") : [];
};

export const getVehicles = async () => {
  const { data } = await api.get("/tourmanager/vehicles");
  return Array.isArray(data?.data) ? data.data : Array.isArray(data?.vehicles) ? data.vehicles : [];
};

export const assignTour = async (tourId, assignmentData) => {
  const { data } = await api.put(`/tourmanager/tours/${tourId}/assign`, assignmentData);
  return data;
};
