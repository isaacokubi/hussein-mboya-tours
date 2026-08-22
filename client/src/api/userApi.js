import api from "./axios";

export const getProfile = async () => {
  return api.get("/users/profile");
};



/*
 Auto completed API helpers
*/

export const getAll = async()=>{
    const {data}=await api.get("/users/profile");
    return data;
};

