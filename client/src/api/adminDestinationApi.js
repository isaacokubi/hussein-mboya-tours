/**
 * Purpose: admin Destination Api client application module. Main declarations: getDestinations, getDestination, getDestinationBySlug, getAdminDestinations, getAdminDestinationById.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";


/*
|--------------------------------------------------------------------------
| PUBLIC DESTINATIONS
|--------------------------------------------------------------------------
*/

// Declare getDestinations for use by the surrounding module or function.
export const getDestinations = async (params = {}) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/destinations",
    {
      params,
    }
  );

  // Return the expression shown below to the caller.
  return (
    data.data ||
    data.destinations ||
    data ||
    []
  );
};


// Declare getDestination for use by the surrounding module or function.
export const getDestination = async (id) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    `/destinations/${id}`
  );

  // Return the expression shown below to the caller.
  return data.data || data;
};


// Declare getDestinationBySlug for use by the surrounding module or function.
export const getDestinationBySlug = async (slug) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    `/destinations/slug/${slug}`
  );

  // Return the expression shown below to the caller.
  return data.data || data;
};



/*
|--------------------------------------------------------------------------
| ADMIN DESTINATIONS
|--------------------------------------------------------------------------
*/


// Declare getAdminDestinations for use by the surrounding module or function.
export const getAdminDestinations = async () => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/admin/destinations"
  );

  // Return the expression shown below to the caller.
  return (
    data.data ||
    data.destinations ||
    data ||
    []
  );

};



// Declare getAdminDestinationById for use by the surrounding module or function.
export const getAdminDestinationById = async (id) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    `/admin/destinations/${id}`
  );

  // Return the expression shown below to the caller.
  return data.data || data;

};



// Declare createDestination for use by the surrounding module or function.
export const createDestination = async (destination) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post(
    "/admin/destinations",
    destination,
    {
      headers:{
        "Content-Type":"multipart/form-data"
      }
    }
  );

  // Return the value of data to the caller.
  return data;

};



// Declare updateDestination for use by the surrounding module or function.
export const updateDestination = async (
  id,
  destination
) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(
    `/admin/destinations/${id}`,
    destination,
    {
      headers:{
        "Content-Type":"multipart/form-data"
      }
    }
  );

  // Return the value of data to the caller.
  return data;

};



// Declare deleteDestination for use by the surrounding module or function.
export const deleteDestination = async (id) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(
    `/admin/destinations/${id}`
  );

  // Return the value of data to the caller.
  return data;

};
