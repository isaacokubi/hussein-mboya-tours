import api from "./axios";



export const createTour =
async(formData)=>{


const response =
await api.post(

"/admin/tours",

formData,

{

headers:{

"Content-Type":
"multipart/form-data"

}

}

);


return response.data;

};




export const getAdminTours =
async()=>{


const response =
await api.get(
"/admin/tours"
);


return response.data;

};




export const deleteTour =
async(id)=>{


return await api.delete(

`/admin/tours/${id}`

);


};