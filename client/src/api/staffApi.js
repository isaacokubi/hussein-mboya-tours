import api from "./axios";


export const getStaff = async () => {
  const response = await api.get("/staff");
  return response.data;
};



/*
 Auto completed API helpers
*/

export const getAll = async()=>{
    const {data}=await api.get("/staff");
    return data;
};

