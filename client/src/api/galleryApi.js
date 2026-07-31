import api from "./axios";


export const getFeaturedGallery = async()=>{


const response =
await api.get(
"/gallery/featured"
);



return response.data.images;


};