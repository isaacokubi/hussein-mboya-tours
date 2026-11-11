/**
 * Purpose: analytics Api client application module. Main declarations: getAnalytics, getRevenueAnalytics.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/services/analyticsService.js

// Load ./axios so this module can use its exported dependencies.
import api from "./axios";

/*
|--------------------------------------------------------------------------
| GET ANALYTICS
|--------------------------------------------------------------------------
*/

// Declare getAnalytics for use by the surrounding module or function.
export const getAnalytics = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/analytics", {
    params,
  });

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| GET REVENUE ANALYTICS
|--------------------------------------------------------------------------
*/

// Declare getRevenueAnalytics for use by the surrounding module or function.
export const getRevenueAnalytics = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/analytics/revenue", {
    params,
  });

  // Return the value of data to the caller.
  return data;
};
