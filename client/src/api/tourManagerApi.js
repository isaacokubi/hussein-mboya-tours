import api from "./axios";

export const getDashboardStats = async () => {
  const { data } = await api.get("/tourmanager/dashboard");
  return data;
};

export const getTours = async (params = {}) => {
  const { data } = await api.get("/tourmanager/tours", { params });
  return data;
};

export const createTour = async (tourData) => {
  const { data } = await api.post("/tourmanager/tours", tourData);
  return data;
};

export const updateTour = async (id, tourData) => {
  const { data } = await api.put(`/tourmanager/tours/${id}`, tourData);
  return data;
};

export const deleteTour = async (id) => {
  const { data } = await api.delete(`/tourmanager/tours/${id}`);
  return data;
};

export const assignGuide = async (tourId, guideId) => {
  const { data } = await api.post("/tourmanager/assign-guide", { tourId, guideId });
  return data;
};

export const createItinerary = async (itineraryData) => {
  const { data } = await api.post("/tourmanager/itineraries", itineraryData);
  return data;
};

export const getItineraries = async (params = {}) => {
  const { data } = await api.get("/tourmanager/itineraries", { params });
  return data;
};

export const getItinerary = async (id) => {
  const { data } = await api.get(`/tourmanager/itineraries/${id}`);
  return data;
};

export const updateItinerary = async (id, itineraryData) => {
  const { data } = await api.put(`/tourmanager/itineraries/${id}`, itineraryData);
  return data;
};

export const deleteItinerary = async (id) => {
  const { data } = await api.delete(`/tourmanager/itineraries/${id}`);
  return data;
};

export const getBookings = async (params = {}) => {
  const { data } = await api.get("/tourmanager/bookings", { params });
  return data;
};

export const completeBooking = async (id) => {
  const { data } = await api.patch(`/tourmanager/bookings/${id}/complete`);
  return data;
};

export const cancelBooking = async (id, reason = "Cancelled by tour manager") => {
  const { data } = await api.patch(`/tourmanager/bookings/${id}/cancel`, { reason });
  return data;
};

export const getCustomers = async (params = {}) => {
  const { data } = await api.get("/tourmanager/customers", { params });
  return data;
};

export const getGuides = async () => {
  const { data } = await api.get("/tourmanager/guides");
  return data;
};

export const getReports = async (params = {}) => {
  const { data } = await api.get("/tourmanager/reports", { params });
  return data;
};

export const getTourAvailability = async (id) => {
  const { data } = await api.get(`/tourmanager/tours/${id}/availability`);
  return data;
};

export const updateTourAvailability = async (id, payload) => {
  const { data } = await api.put(`/tourmanager/tours/${id}/availability`, payload);
  return data;
};

// Backward-compatible aliases used by existing Manager components.
export const deleteManagerTour = deleteTour;
export const getManagerTours = getTours;
export const createManagerTour = createTour;
export const updateManagerTour = updateTour;
