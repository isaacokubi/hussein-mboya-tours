// client/src/services/analyticsService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| GET ANALYTICS
|--------------------------------------------------------------------------
*/

export const getAnalytics = async (params = {}) => {
  const { data } = await api.get("/analytics", {
    params,
  });

  return data;
};

/*
|--------------------------------------------------------------------------
| GET REVENUE ANALYTICS
|--------------------------------------------------------------------------
*/

export const getRevenueAnalytics = async (params = {}) => {
  const { data } = await api.get("/analytics/revenue", {
    params,
  });

  return data;
};
