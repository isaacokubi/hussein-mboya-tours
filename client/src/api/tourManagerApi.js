/**
 * Purpose: tour Manager Api client application module. Main declarations: createOperationsQuoteDraft, getOperationsCopilotSummary, getDashboardStats, getTours, createTour.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare createOperationsQuoteDraft for use by the surrounding module or function.
export const createOperationsQuoteDraft = async (payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post("/tourmanager/copilot/quote-draft", payload);
  // Return the value of data to the caller.
  return data;
};

// Declare getOperationsCopilotSummary for use by the surrounding module or function.
export const getOperationsCopilotSummary = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/copilot/summary");
  // Return the value of data to the caller.
  return data;
};

// Declare getDashboardStats for use by the surrounding module or function.
export const getDashboardStats = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/dashboard");
  // Return the value of data to the caller.
  return data;
};

// Declare getTours for use by the surrounding module or function.
export const getTours = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/tours", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare createTour for use by the surrounding module or function.
export const createTour = async (tourData) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post("/tourmanager/tours", tourData);
  // Return the value of data to the caller.
  return data;
};

// Declare updateTour for use by the surrounding module or function.
export const updateTour = async (id, tourData) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/tourmanager/tours/${id}`, tourData);
  // Return the value of data to the caller.
  return data;
};

// Declare deleteTour for use by the surrounding module or function.
export const deleteTour = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(`/tourmanager/tours/${id}`);
  // Return the value of data to the caller.
  return data;
};

// Declare assignGuide for use by the surrounding module or function.
export const assignGuide = async (tourId, guideId) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post("/tourmanager/assign-guide", { tourId, guideId });
  // Return the value of data to the caller.
  return data;
};

// Declare createItinerary for use by the surrounding module or function.
export const createItinerary = async (itineraryData) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post("/tourmanager/itineraries", itineraryData);
  // Return the value of data to the caller.
  return data;
};

// Declare getItineraries for use by the surrounding module or function.
export const getItineraries = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/itineraries", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare getItinerary for use by the surrounding module or function.
export const getItinerary = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/tourmanager/itineraries/${id}`);
  // Return the value of data to the caller.
  return data;
};

// Declare updateItinerary for use by the surrounding module or function.
export const updateItinerary = async (id, itineraryData) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/tourmanager/itineraries/${id}`, itineraryData);
  // Return the value of data to the caller.
  return data;
};

// Declare deleteItinerary for use by the surrounding module or function.
export const deleteItinerary = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(`/tourmanager/itineraries/${id}`);
  // Return the value of data to the caller.
  return data;
};

// Declare getBookings for use by the surrounding module or function.
export const getBookings = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/bookings", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare sendBookingNotification for use by the surrounding module or function.
export const sendBookingNotification = async (id, channel, type = "payment_reminder") => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post(`/tourmanager/bookings/${id}/notify`, { type, channel });
  // Return the value of data to the caller.
  return data;
};

// Declare completeBooking for use by the surrounding module or function.
export const completeBooking = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.patch(`/tourmanager/bookings/${id}/complete`);
  // Return the value of data to the caller.
  return data;
};

// Declare cancelBooking for use by the surrounding module or function.
export const cancelBooking = async (id, reason = "Cancelled by tour manager") => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.patch(`/tourmanager/bookings/${id}/cancel`, { reason });
  // Return the value of data to the caller.
  return data;
};

// Declare getCustomers for use by the surrounding module or function.
export const getCustomers = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/customers", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare getGuides for use by the surrounding module or function.
export const getGuides = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/guides");
  // Return the value of data to the caller.
  return data;
};

// Declare getReports for use by the surrounding module or function.
export const getReports = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/reports", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare getTourAvailability for use by the surrounding module or function.
export const getTourAvailability = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/tourmanager/tours/${id}/availability`);
  // Return the value of data to the caller.
  return data;
};

// Declare updateTourAvailability for use by the surrounding module or function.
export const updateTourAvailability = async (id, payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/tourmanager/tours/${id}/availability`, payload);
  // Return the value of data to the caller.
  return data;
};

// Backward-compatible aliases used by existing Manager components.
// Declare deleteManagerTour for use by the surrounding module or function.
export const deleteManagerTour = deleteTour;
// Declare getManagerTours for use by the surrounding module or function.
export const getManagerTours = getTours;
// Declare createManagerTour for use by the surrounding module or function.
export const createManagerTour = createTour;
// Declare updateManagerTour for use by the surrounding module or function.
export const updateManagerTour = updateTour;

// Declare getCalendarReminders for use by the surrounding module or function.
export const getCalendarReminders = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/tourmanager/calendar/reminders", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare createCalendarReminder for use by the surrounding module or function.
export const createCalendarReminder = async (reminder) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post("/tourmanager/calendar/reminders", reminder);
  // Return the value of data to the caller.
  return data;
};

// Declare deleteCalendarReminder for use by the surrounding module or function.
export const deleteCalendarReminder = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(`/tourmanager/calendar/reminders/${id}`);
  // Return the value of data to the caller.
  return data;
};
