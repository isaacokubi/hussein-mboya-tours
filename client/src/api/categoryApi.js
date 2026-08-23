import api from "./axios";



export const getCategories = async()=>{


const response = await api.get(

"/categories"

);



return response.data.categories;


};



/*
 Auto completed API helpers
*/

export const getAll = async()=>{
    const {data}=await api.get("/categories");
    return data;
};
