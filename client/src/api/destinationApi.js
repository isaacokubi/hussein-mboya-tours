/**
 * Purpose: destination Api client application module. Main declarations: getFeaturedDestinations, getDestinations, getDestinationBySlug.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";


// Declare getFeaturedDestinations for use by the surrounding module or function.
export const getFeaturedDestinations = async()=>{

  // Declare response for use by the surrounding module or function.
  const response = await api.get(
    "/destinations/featured"
  );


  // Declare destinations for use by the surrounding module or function.
  const destinations =

    Array.isArray(response.data)

    ? response.data

    : Array.isArray(response.data.data)

    ? response.data.data

    : Array.isArray(response.data.destinations)

    ? response.data.destinations

    : [];



  // Return the value of destinations to the caller.
  return destinations;

};

// Declare getDestinations for use by the surrounding module or function.
export const getDestinations = async()=>{

    // Declare response for use by the surrounding module or function.
    const response = await api.get(
        "/destinations"
    );


    // Return the expression shown below to the caller.
    return Array.isArray(response.data)
        ? response.data
        :
        response.data.data ||
        response.data.destinations ||
        [];

};



// Declare getDestinationBySlug for use by the surrounding module or function.
export const getDestinationBySlug = async(slug)=>{

  // Declare response for use by the surrounding module or function.
  const response = await api.get(
    `/destinations/${slug}`
  );


  // Return the expression shown below to the caller.
  return (
    response.data.destination ||
    response.data.data ||
    null
  );

};
