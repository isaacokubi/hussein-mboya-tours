/**
 * Purpose: tour Assignment Api client application module. Main declarations: getTours, getGuides, getDrivers, getVehicles, assignTour.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getTours for use by the surrounding module or function.
export const getTours = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/tours", { params });
  // Return the expression shown below to the caller.
  return Array.isArray(data?.tours) ? data.tours : Array.isArray(data?.data) ? data.data : [];
};

// Declare getGuides for use by the surrounding module or function.
export const getGuides = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/guides");
  // Return the expression shown below to the caller.
  return Array.isArray(data?.data) ? data.data : Array.isArray(data?.guides) ? data.guides : [];
};

// Declare getDrivers for use by the surrounding module or function.
export const getDrivers = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/drivers");
  // Return the expression shown below to the caller.
  return Array.isArray(data?.data) ? data.data : Array.isArray(data?.staff) ? data.staff : [];
};

// Declare getVehicles for use by the surrounding module or function.
export const getVehicles = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/vehicles");
  // Return the expression shown below to the caller.
  return Array.isArray(data?.data) ? data.data : Array.isArray(data?.vehicles) ? data.vehicles : [];
};

// Declare assignTour for use by the surrounding module or function.
export const assignTour = async (tourId, assignmentData) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/tourmanager/tours/${tourId}/assign`, assignmentData);
  // Return the value of data to the caller.
  return data;
};

// Declare completeTour for use by the surrounding module or function.
export const completeTour = async (tourId) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.patch(`/tourmanager/tours/${tourId}/complete`);
  // Return the value of data to the caller.
  return data;
};

// Declare cancelTour for use by the surrounding module or function.
export const cancelTour = async (tourId, reason) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.patch(`/tourmanager/tours/${tourId}/cancel`, { reason });
  // Return the value of data to the caller.
  return data;
};
