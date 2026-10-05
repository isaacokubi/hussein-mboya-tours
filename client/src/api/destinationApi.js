import api from "./axios";


export const getFeaturedDestinations = async()=>{

  const response = await api.get(
    "/destinations/featured"
  );


  const destinations =

    Array.isArray(response.data)

    ? response.data

    : Array.isArray(response.data.data)

    ? response.data.data

    : Array.isArray(response.data.destinations)

    ? response.data.destinations

    : [];



  return destinations;

};

export const getDestinations = async()=>{

    const response = await api.get(
        "/destinations"
    );


    return Array.isArray(response.data)
        ? response.data
        :
        response.data.data ||
        response.data.destinations ||
        [];

};



export const getDestinationBySlug = async(slug)=>{

  const response = await api.get(
    `/destinations/${slug}`
  );


  return (
    response.data.destination ||
    response.data.data ||
    null
  );

};
