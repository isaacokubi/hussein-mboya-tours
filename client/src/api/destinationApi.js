import api from "./axios";


export const getFeaturedDestinations = async()=>{

  const response = await api.get(
    "/destinations/featured"
  );


  console.log("DESTINATION RESPONSE:", response.data);


  return response.data.data || [];

};