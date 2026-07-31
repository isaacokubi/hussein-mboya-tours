// client/src/services/guideService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| GUIDE DASHBOARD
|--------------------------------------------------------------------------
*/

export const getGuideDashboard = async () => {
  const { data } = await api.get(
    "/guide/dashboard"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| ASSIGNED TOURS
|--------------------------------------------------------------------------
*/

export const getAssignedTours = async (params = {}) => {
  const { data } = await api.get(
    "/guide/assigned-tours",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| TOUR GUESTS
|--------------------------------------------------------------------------
*/

export const getTourGuests = async (tourId) => {
  const { data } = await api.get(
    `/guide/tours/${tourId}/guests`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| UPDATE TOUR STATUS
|--------------------------------------------------------------------------
*/

export const updateTourStatus = async (
  tourId,
  status
) => {
  const { data } = await api.put(
    `/guide/tours/${tourId}/status`,
    {
      status,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| SUBMIT TOUR REPORT
|--------------------------------------------------------------------------
*/

export const submitTourReport = async (
  tourId,
  reportData
) => {
  const { data } = await api.post(
    `/guide/tours/${tourId}/report`,
    reportData
  );

  return data;
};