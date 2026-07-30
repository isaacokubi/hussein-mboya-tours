import api from "./axios";


export const getDestinations = async () => {

  const response = await api.get(
    "/destinations"
  );


  return response.data;

};