import api from "./axios";


export const getFeaturedDestinations = async()=>{

  const response = await api.get(
    "/destinations/featured"
  );


  console.log(
    "DESTINATION RESPONSE:",
    response.data
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


    console.log(
        "ALL DESTINATIONS RESPONSE:",
        response.data
    );


    return Array.isArray(response.data)
        ? response.data
        :
        response.data.data ||
        response.data.destinations ||
        [];

};

