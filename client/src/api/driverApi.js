/**
 * Purpose: driver Api client application module. Main declarations: getDriverDashboard, getDriverAssignedTours, getDriverTour, getDriverTourGuests, updateDriverTourStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getDriverDashboard for use by the surrounding module or function.
export const getDriverDashboard = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/driver/dashboard");
  // Return the value of data to the caller.
  return data;
};

// Declare getDriverAssignedTours for use by the surrounding module or function.
export const getDriverAssignedTours = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/driver/assigned-tours");
  // Return the value of data to the caller.
  return data;
};

// Declare getDriverTour for use by the surrounding module or function.
export const getDriverTour = async (tourId) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/driver/tours/${tourId}`);
  // Return the value of data to the caller.
  return data;
};

// Declare getDriverTourGuests for use by the surrounding module or function.
export const getDriverTourGuests = async (tourId) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/driver/tours/${tourId}/guests`);
  // Return the value of data to the caller.
  return data;
};

// Declare updateDriverTourStatus for use by the surrounding module or function.
export const updateDriverTourStatus = async (tourId, status) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/driver/tours/${tourId}/status`, { status });
  // Return the value of data to the caller.
  return data;
};
