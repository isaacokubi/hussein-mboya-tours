import api from "./axios";




export const getAssignedTours = async()=>{


const response =
await api.get(
"/guide/assigned-tours"
);


return response.data;


};







export const getTourGuests = async(id)=>{


const response =
await api.get(
`/guide/tours/${id}/guests`
);


return response.data;


};







export const updateTourStatus =
async(id,status)=>{


const response =
await api.put(

`/guide/tours/${id}/status`,

{
status
}

);


return response.data;


};







export const submitTourReport =
async(id,data)=>{


const response =
await api.post(

`/guide/tours/${id}/report`,

data

);


return response.data;


};