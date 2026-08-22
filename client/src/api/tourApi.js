import api from "./axios";

/* Public tours */
export const getTours = async (category = null) => {
  const { data } = await api.get("/tours", {
    params: category ? { category } : {},
  });
  return data;
};

export const getFeaturedTours = async () => {
  try {
    const { data } = await api.get("/tours/featured");
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  } catch (featuredError) {
    // The homepage should still show published tours if the optional
    // featured query fails. Preserve the original error only when the
    // canonical public tours endpoint also fails.
    try {
      const { data } = await api.get("/tours", { params: { limit: 6, featured: "true" } });
      const fallback = Array.isArray(data?.data) ? data.data : Array.isArray(data?.tours) ? data.tours : Array.isArray(data) ? data : [];
      if (fallback.length) return fallback;
    } catch {
      // Fall through to the original error so React Query reports the
      // real backend failure rather than hiding it.
    }
    throw featuredError;
  }
};

export const getTourById = async (id) => {
  const { data } = await api.get(`/tours/${id}`);
  return data?.data || data;
};

export const getTour = getTourById;

export const getTourBySlug = async (slug) => {
  const { data } = await api.get(`/tours/slug/${slug}`);
  return data?.data || data;
};

/* Tour Manager */
export const getManagerTours = async (params = {}) => {
  const { data } = await api.get("/tours/manager", { params });
  return data;
};

export const getUpcomingTours = async (params = {}) => {
  const { data } = await api.get("/tourmanager/tours", {
    params: { ...params, upcoming: "true" },
  });
  return data;
};

export const createTour = async (payload) => {
  const { data } = await api.post("/tours", payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
};

export const updateTour = async (id, payload) => {
  const { data } = await api.put(`/tours/${id}`, payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
};

export const deleteTour = async (id) => {
  const { data } = await api.delete(`/tours/${id}`);
  return data;
};

/* Staff/resources */
export const getGuides = async () => {
  const { data } = await api.get("/staff/guides");
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.guides) ? data.data.guides : Array.isArray(data?.guides) ? data.guides : [];
};

export const getDrivers = async () => {
  const { data } = await api.get("/staff/drivers");
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.drivers) ? data.data.drivers : Array.isArray(data?.drivers) ? data.drivers : [];
};

export const getVehicles = async () => {
  const { data } = await api.get("/vehicles");
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.vehicles) ? data.data.vehicles : Array.isArray(data?.vehicles) ? data.vehicles : [];
};

export const assignTourResources = async (tourId, assignmentData) => {
  const { data } = await api.put(`/tour-assignments/${tourId}/assign`, assignmentData);
  return data;
};

export const assignGuide = (tourId, guideId) => assignTourResources(tourId, { guideId });
export const assignDriver = (tourId, driverId) => assignTourResources(tourId, { driverId });
export const assignVehicle = (tourId, vehicleId) => assignTourResources(tourId, { vehicleId });

/* Destinations */
export const getDestinations = async () => {
  const { data } = await api.get("/destinations");
  return data;
};

/* Availability */
export const getTourAvailability = async (id) => {
  const { data } = await api.get(`/tours/${id}/availability`);
  return data;
};

export const updateTourAvailability = async (id, payload) => {
  const { data } = await api.patch(`/tours/${id}/availability`, payload);
  return data;
};

/* Reports */
export const getTourReports = async (params = {}) => {
  const { data } = await api.get("/tourmanager/reports", { params });
  return data;
};
