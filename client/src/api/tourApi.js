/**
 * Purpose: tour Api client application module. Main declarations: getTours, getFeaturedTours, getTourById, getTourBySlug, getManagerTours.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

/* Public tours */
// Declare getTours for use by the surrounding module or function.
export const getTours = async (params = null) => {
  // Declare query for use by the surrounding module or function.
  const query = typeof params === "string" ? { category: params } : (params || {});
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tours", { params: query });
  // Return the value of data to the caller.
  return data;
};

// Declare getFeaturedTours for use by the surrounding module or function.
export const getFeaturedTours = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { data } for use by the surrounding module or function.
    const { data } = await api.get("/tours/featured");
    // Return the expression shown below to the caller.
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  } catch (featuredError) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare { data } for use by the surrounding module or function.
      const { data } = await api.get("/tours", { params: { limit: 6, featured: "true" } });
      // Declare fallback for use by the surrounding module or function.
      const fallback = Array.isArray(data?.data) ? data.data : Array.isArray(data?.tours) ? data.tours : Array.isArray(data) ? data : [];
      // Check the condition (fallback.length) and run the matching branch.
      if (fallback.length) return fallback;
    } catch {
      // Fall through to the original error.
    }
    // Stop the current operation by raising the value of featuredError.
    throw featuredError;
  }
};

// Declare getTourById for use by the surrounding module or function.
export const getTourById = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/tours/${id}`);
  // Return the expression shown below to the caller.
  return data?.data || data;
};

// Declare getTour for use by the surrounding module or function.
export const getTour = getTourById;

// Declare getTourBySlug for use by the surrounding module or function.
export const getTourBySlug = async (slug, { signal } = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/tours/slug/${encodeURIComponent(slug)}`, { signal });
  // Return the expression shown below to the caller.
  return data?.data || data;
};

/* Tour Manager */
// Declare getManagerTours for use by the surrounding module or function.
export const getManagerTours = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tours/manager", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare getUpcomingTours for use by the surrounding module or function.
export const getUpcomingTours = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/tours", {
    params: { ...params, upcoming: "true" },
  });
  // Return the value of data to the caller.
  return data;
};

// Declare createTour for use by the surrounding module or function.
export const createTour = async (payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post("/tours", payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  // Return the value of data to the caller.
  return data;
};

// Declare updateTour for use by the surrounding module or function.
export const updateTour = async (id, payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/tours/${id}`, payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  // Return the value of data to the caller.
  return data;
};

// Declare deleteTour for use by the surrounding module or function.
export const deleteTour = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(`/tours/${id}`);
  // Return the value of data to the caller.
  return data;
};

/* Staff/resources */
// Declare getGuides for use by the surrounding module or function.
export const getGuides = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/staff/guides");
  // Return the expression shown below to the caller.
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.guides) ? data.data.guides : Array.isArray(data?.guides) ? data.guides : [];
};

// Declare getDrivers for use by the surrounding module or function.
export const getDrivers = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/staff/drivers");
  // Return the expression shown below to the caller.
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.drivers) ? data.data.drivers : Array.isArray(data?.drivers) ? data.drivers : [];
};

// Declare getVehicles for use by the surrounding module or function.
export const getVehicles = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/vehicles");
  // Return the expression shown below to the caller.
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.vehicles) ? data.data.vehicles : Array.isArray(data?.vehicles) ? data.vehicles : [];
};

// Declare assignTourResources for use by the surrounding module or function.
export const assignTourResources = async (tourId, assignmentData) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/tour-assignments/${tourId}/assign`, assignmentData);
  // Return the value of data to the caller.
  return data;
};

// Declare assignGuide for use by the surrounding module or function.
export const assignGuide = (tourId, guideId) => assignTourResources(tourId, { guideId });
// Declare assignDriver for use by the surrounding module or function.
export const assignDriver = (tourId, driverId) => assignTourResources(tourId, { driverId });
// Declare assignVehicle for use by the surrounding module or function.
export const assignVehicle = (tourId, vehicleId) => assignTourResources(tourId, { vehicleId });

/* Destinations */
// Declare getDestinations for use by the surrounding module or function.
export const getDestinations = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/destinations");
  // Return the value of data to the caller.
  return data;
};

/* Availability */
// Declare getTourAvailability for use by the surrounding module or function.
export const getTourAvailability = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/tours/${id}/availability`);
  // Return the value of data to the caller.
  return data;
};

// Declare updateTourAvailability for use by the surrounding module or function.
export const updateTourAvailability = async (id, payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.patch(`/tours/${id}/availability`, payload);
  // Return the value of data to the caller.
  return data;
};

/* Reports */
// Declare getTourReports for use by the surrounding module or function.
export const getTourReports = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/reports", { params });
  // Return the value of data to the caller.
  return data;
};
