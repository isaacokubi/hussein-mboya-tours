import api from "./axios";


export const getHeroSlides = async () => {

  const response = await api.get("/hero");

  console.log("HERO API RESPONSE:", response.data);

  return response.data.slides || [];

};