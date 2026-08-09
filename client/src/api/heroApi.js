import api from "./axios";


export const getHeroSlides = async () => {

  const response = await api.get("/hero");

  console.log("HERO API RESPONSE:", response.data);

  return Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data.slides)
    ? response.data.slides
    : Array.isArray(response.data.data)
    ? response.data.data
    : [];

};



/*
 Auto completed API helpers
*/

export const getAll = async()=>{
    const {data}=await api.get("/hero");
    return data;
};

