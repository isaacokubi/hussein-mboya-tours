import api from "./axios";

export const getDriverDashboard = async () => {
  const { data } = await api.get("/driver/dashboard");
  return data;
};
