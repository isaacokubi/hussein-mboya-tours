import api from "./axios";



export const getHeroSlides = async()=>{


const response = await api.get(

"/hero"

);



return response.data.slides;


};