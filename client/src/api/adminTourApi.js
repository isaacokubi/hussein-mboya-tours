import api from "./axios";

/*
|--------------------------------------------------------------------------
| PUBLIC TOURS
|--------------------------------------------------------------------------
*/

export const getTours = async (params = {}) => {
  const { data } = await api.get(
    "/tours",
    {
      params,
    }
  );

  return data;
};

export const getTour = async (id) => {

  console.log("EDIT TOUR REQUEST:", id);

  const { data } = await api.get(
    `/admin/tours/${id}`
  );

  console.log("EDIT TOUR RESPONSE:", data);

  return data.tour;

};

export const getTourBySlug = async (slug) => {
  const { data } = await api.get(
    `/tours/slug/${slug}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| ADMIN TOURS
|--------------------------------------------------------------------------
*/

export const getAdminTours = async (params = {}) => {
  const { data } = await api.get(
    "/admin/tours",
    {
      params,
    }
  );

  return data;
};

export const createTour = async (formData) => {
  const { data } = await api.post(
    "/admin/tours",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

export const updateTour = async (
  id,
  formData
) => {
  const { data } = await api.put(
    `/admin/tours/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

export const deleteTour = async (id) => {
  const { data } = await api.delete(
    `/admin/tours/${id}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| SUPPORT DATA
|--------------------------------------------------------------------------
*/

export const getGuides = async () => {

  const { data } = await api.get(
    "/guides"
  );

  return data.guides || data.data || data.users || data;

};


export const getVehicles = async () => {

  const { data } = await api.get(
    "/vehicles"
  );

  return data.vehicles || data.data || data;

};


export const getDestinations = async () => {

  const { data } = await api.get(
    "/destinations"
  );

  return data.destinations || data.data || data;

};

