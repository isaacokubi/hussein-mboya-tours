import api from "./axios";


export const searchTours =
async(filters)=>{


const response =
await api.get(

"/tours/search",

{
params:filters
}

);



return response.data;


};