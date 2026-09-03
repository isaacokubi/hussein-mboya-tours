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
  const { data } = await api.get("/tourmanager/drivers");
  return Array.isArray(data?.data) ? data.data : Array.isArray(data?.staff) ? data.staff : [];
};

export const getVehicles = async () => {
  const { data } = await api.get("/tourmanager/vehicles");
  return Array.isArray(data?.data) ? data.data : Array.isArray(data?.vehicles) ? data.vehicles : [];
};

export const assignTour = async (tourId, assignmentData) => {
  const { data } = await api.put(`/tourmanager/tours/${tourId}/assign`, assignmentData);
  return data;
};

export const completeTour = async (tourId) => {
  const { data } = await api.patch(`/tourmanager/tours/${tourId}/complete`);
  return data;
};

export const cancelTour = async (tourId, reason) => {
  const { data } = await api.patch(`/tourmanager/tours/${tourId}/cancel`, { reason });
  return data;
};
