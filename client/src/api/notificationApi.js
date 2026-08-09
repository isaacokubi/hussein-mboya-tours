import api from "./axios";

export const getNotifications = async (params = {}) => {
  const response = await api.get("/notifications", {
    params,
  });

  return response.data;
};



/*
 Auto completed API helpers
*/

export const getAll = async()=>{
    const {data}=await api.get("/notifications");
    return data;
};

