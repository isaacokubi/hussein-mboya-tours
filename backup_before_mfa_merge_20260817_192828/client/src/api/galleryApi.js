import api from "./axios";


export const getFeaturedGallery = async()=>{


const response =
await api.get(
"/gallery/featured"
);



return Array.isArray(response.data)
? response.data
: Array.isArray(response.data.images)
? response.data.images
: Array.isArray(response.data.data)
? response.data.data
: [];


};



/*
 Auto completed API helpers
*/

export const getAll = async()=>{
    const {data}=await api.get("/gallery/featured");
    return data;
};

