import api from "./axios";

export const getDriverDashboard = async () => {
  const { data } = await api.get("/driver/dashboard");
  return data;
};

export const getDriverAssignedTours = async () => {
  const { data } = await api.get("/driver/assigned-tours");
  return data;
};

export const getDriverTour = async (tourId) => {
  const { data } = await api.get(`/driver/tours/${tourId}`);
  return data;
};

export const getDriverTourGuests = async (tourId) => {
  const { data } = await api.get(`/driver/tours/${tourId}/guests`);
  return data;
};

export const updateDriverTourStatus = async (tourId, status) => {
  const { data } = await api.put(`/driver/tours/${tourId}/status`, { status });
  return data;
};
