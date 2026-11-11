/**
 * Purpose: guide Api client application module. Main declarations: getGuideDashboard, getAssignedTours, getTourGuests, updateTourStatus, submitTourReport.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/services/guideService.js

// Load ./axios so this module can use its exported dependencies.
import api from "./axios";

/*
|--------------------------------------------------------------------------
| GUIDE DASHBOARD
|--------------------------------------------------------------------------
*/

// Declare getGuideDashboard for use by the surrounding module or function.
export const getGuideDashboard = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/guide/dashboard"
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| ASSIGNED TOURS
|--------------------------------------------------------------------------
*/

// Declare getAssignedTours for use by the surrounding module or function.
export const getAssignedTours = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/guide/assigned-tours",
    {
      params,
    }
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| TOUR GUESTS
|--------------------------------------------------------------------------
*/

// Declare getTourGuests for use by the surrounding module or function.
export const getTourGuests = async (tourId) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    `/guide/tours/${tourId}/guests`
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| UPDATE TOUR STATUS
|--------------------------------------------------------------------------
*/

// Declare updateTourStatus for use by the surrounding module or function.
export const updateTourStatus = async (
  tourId,
  status
) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(
    `/guide/tours/${tourId}/status`,
    {
      status,
    }
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| SUBMIT TOUR REPORT
|--------------------------------------------------------------------------
*/

// Declare submitTourReport for use by the surrounding module or function.
export const submitTourReport = async (
  tourId,
  reportData
) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post(
    `/guide/tours/${tourId}/report`,
    reportData
  );

  // Return the value of data to the caller.
  return data;
};
