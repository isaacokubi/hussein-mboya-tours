/**
 * Purpose: admin Tour Api client application module. Main declarations: getTours, getTour, getTourBySlug, getAdminTours, createTour.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

/*
|--------------------------------------------------------------------------
| PUBLIC TOURS
|--------------------------------------------------------------------------
*/

// Declare getTours for use by the surrounding module or function.
export const getTours = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/tours",
    {
      params,
    }
  );

  // Return the value of data to the caller.
  return data;
};

// Declare getTour for use by the surrounding module or function.
export const getTour = async (id) => {



  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    `/admin/tours/${id}`
  );



  // Return the tour value to the caller.
  return data.tour;

};

// Declare getTourBySlug for use by the surrounding module or function.
export const getTourBySlug = async (slug) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    `/tours/slug/${slug}`
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| ADMIN TOURS
|--------------------------------------------------------------------------
*/

// Declare getAdminTours for use by the surrounding module or function.
export const getAdminTours = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/admin/tours",
    {
      params,
    }
  );

  // Return the value of data to the caller.
  return data;
};

// Declare createTour for use by the surrounding module or function.
export const createTour = async (formData) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post(
    "/admin/tours",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  // Return the value of data to the caller.
  return data;
};

// Declare updateTour for use by the surrounding module or function.
export const updateTour = async (
  id,
  formData
) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(
    `/admin/tours/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  // Return the value of data to the caller.
  return data;
};

// Declare deleteTour for use by the surrounding module or function.
export const deleteTour = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(
    `/admin/tours/${id}`
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| SUPPORT DATA
|--------------------------------------------------------------------------
*/

// Declare getGuides for use by the surrounding module or function.
export const getGuides = async () => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/users/guides"
  );

  // Return the expression shown below to the caller.
  return data.guides || data.data || data.users || data;

};


// Declare getVehicles for use by the surrounding module or function.
export const getVehicles = async () => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/vehicles"
  );

  // Return the expression shown below to the caller.
  return data.vehicles || data.data || data;

};


// Declare getDestinations for use by the surrounding module or function.
export const getDestinations = async () => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/destinations"
  );

  // Return the expression shown below to the caller.
  return data.destinations || data.data || data;

};
