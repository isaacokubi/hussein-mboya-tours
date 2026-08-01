// client/src/api/tourApi.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| PUBLIC TOUR APIs
|--------------------------------------------------------------------------
*/

// ============================================================
// GET ALL TOURS
// ============================================================


export const getTours = async (params = {}) => {

  const { data } = await api.get("/tours", {
    params,
  });


  return data;

};
// ============================================================
// GET UPCOMING TOURS
// ============================================================

export const getUpcomingTours = async (params = {}) => {
  const { data } = await api.get(
    "/tours/upcoming",
    {
      params,
    }
  );

  return data;
};


// ============================================================
// GET SINGLE TOUR
// ============================================================

export const getTour = async (id) => {
  const { data } = await api.get(`/tours/${id}`);

  return data;
};


// ============================================================
// COMPATIBILITY ALIAS
// ============================================================

export const getTourById = getTour;


// ============================================================
// GET TOUR BY SLUG
// ============================================================

export const getTourBySlug = async (slug) => {
  const { data } = await api.get(`/tours/slug/${slug}`);

  return data;
};


// ============================================================
// GET FEATURED TOURS
// ============================================================

export const getFeaturedTours = async () => {
  const { data } = await api.get("/tours/featured");

  return data?.tours || data?.data || data || [];
};


/*
|--------------------------------------------------------------------------
| DESTINATION APIs
|--------------------------------------------------------------------------
*/

export const getDestinations = async () => {
  const { data } = await api.get("/destinations");

  return data;
};


/*
|--------------------------------------------------------------------------
| GUIDE APIs
|--------------------------------------------------------------------------
*/

export const getGuides = async () => {
  const { data } = await api.get("/users/guides");

  return data;
};


export const assignGuide = async (
  tourId,
  guideId
) => {
  const { data } = await api.patch(
    `/tours/${tourId}/assign-guide`,
    {
      guideId,
    }
  );

  return data;
};


/*
|--------------------------------------------------------------------------
| VEHICLE APIs
|--------------------------------------------------------------------------
*/

export const getVehicles = async () => {
  const { data } = await api.get("/vehicles");

  return data;
};


export const assignVehicle = async (
  tourId,
  vehicleId
) => {
  const { data } = await api.patch(
    `/tours/${tourId}/assign-vehicle`,
    {
      vehicleId,
    }
  );

  return data;
};


/*
|--------------------------------------------------------------------------
| TOUR MANAGER APIs
|--------------------------------------------------------------------------
*/

export const getManagerTours = async () => {
  const { data } = await api.get(
    "/tours/manager/my-tours"
  );

  return data;
};


export const getManagerTourById = async (id) => {
  const { data } = await api.get(
    `/tours/manager/${id}`
  );

  return data;
};


/*
|--------------------------------------------------------------------------
| ADMIN TOUR APIs
|--------------------------------------------------------------------------
*/

export const createTour = async (
  tourData
) => {
  const { data } = await api.post(
    "/tours",
    tourData
  );

  return data;
};


export const updateTour = async (
  id,
  tourData
) => {
  const { data } = await api.put(
    `/tours/${id}`,
    tourData
  );

  return data;
};


export const deleteTour = async (id) => {
  const { data } = await api.delete(
    `/tours/${id}`
  );

  return data;
};


export const toggleFeaturedTour = async (
  id
) => {
  const { data } = await api.patch(
    `/tours/${id}/featured`
  );

  return data;
};


export const updateTourAvailability = async (
  id,
  availability
) => {
  const { data } = await api.patch(
    `/tours/${id}/availability`,
    availability
  );

  return data;
};


/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY APIs
|--------------------------------------------------------------------------
*/

export const getTourAvailability = async (
  id
) => {
  const { data } = await api.get(
    `/tours/${id}/availability`
  );

  return data;
};


export const checkTourAvailability = async (
  id,
  date
) => {
  const { data } = await api.get(
    `/tours/${id}/availability`,
    {
      params: {
        date,
      },
    }
  );

  return data;
};


/*
|--------------------------------------------------------------------------
| TOUR REPORT APIs
|--------------------------------------------------------------------------
*/

export const getTourReports = async () => {
  const { data } = await api.get(
    "/tours/reports"
  );

  return data;
};


export const getTourReportById = async (
  id
) => {
  const { data } = await api.get(
    `/tours/${id}/report`
  );

  return data;
};


export const submitTourReport = async (
  id,
  reportData
) => {
  const { data } = await api.post(
    `/tours/${id}/report`,
    reportData
  );

  return data;
};


export const updateTourReport = async (
  id,
  reportData
) => {
  const { data } = await api.put(
    `/tours/${id}/report`,
    reportData
  );

  return data;
};


/*
|--------------------------------------------------------------------------
| SEARCH / FILTER
|--------------------------------------------------------------------------
*/

export const searchTours = async (
  params = {}
) => {
  const { data } = await api.get(
    "/tours/search",
    {
      params,
    }
  );

  return data;
};


/*
|--------------------------------------------------------------------------
| REVIEW APIs
|--------------------------------------------------------------------------
*/

export const getTourReviews = async (
  id
) => {
  const { data } = await api.get(
    `/tours/${id}/reviews`
  );

  return data;
};