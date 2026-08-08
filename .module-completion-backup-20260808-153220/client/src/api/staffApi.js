import api from "./axios";


export const getStaff = async () => {
  const response = await api.get("/staff");
  return response.data;
};
