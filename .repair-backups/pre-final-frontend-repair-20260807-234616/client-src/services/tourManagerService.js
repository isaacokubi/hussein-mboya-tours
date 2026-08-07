// client/src/services/tourManagerService.js

import api from "../api/axios";


export const getDashboardStats = async () => {
  const { data } = await api.get(
    "/tourmanager/dashboard"
  );

  return data;
};