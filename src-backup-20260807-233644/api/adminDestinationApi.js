import api from "./axios";


/*
|--------------------------------------------------------------------------
| PUBLIC DESTINATIONS
|--------------------------------------------------------------------------
*/

export const getDestinations = async (params = {}) => {

  const { data } = await api.get(
    "/destinations",
    {
      params,
    }
  );

  return (
    data.data ||
    data.destinations ||
    data ||
    []
  );
};


export const getDestination = async (id) => {

  const { data } = await api.get(
    `/destinations/${id}`
  );

  return data.data || data;
};


export const getDestinationBySlug = async (slug) => {

  const { data } = await api.get(
    `/destinations/slug/${slug}`
  );

  return data.data || data;
};



/*
|--------------------------------------------------------------------------
| ADMIN DESTINATIONS
|--------------------------------------------------------------------------
*/


export const getAdminDestinations = async () => {

  const { data } = await api.get(
    "/admin/destinations"
  );

  return (
    data.data ||
    data.destinations ||
    data ||
    []
  );

};



export const getAdminDestinationById = async (id) => {

  const { data } = await api.get(
    `/admin/destinations/${id}`
  );

  return data.data || data;

};



export const createDestination = async (destination) => {

  const { data } = await api.post(
    "/admin/destinations",
    destination,
    {
      headers:{
        "Content-Type":"multipart/form-data"
      }
    }
  );

  return data;

};



export const updateDestination = async (
  id,
  destination
) => {

  const { data } = await api.put(
    `/admin/destinations/${id}`,
    destination,
    {
      headers:{
        "Content-Type":"multipart/form-data"
      }
    }
  );

  return data;

};



export const deleteDestination = async (id) => {

  const { data } = await api.delete(
    `/admin/destinations/${id}`
  );

  return data;

};
