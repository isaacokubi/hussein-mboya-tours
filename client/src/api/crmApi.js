import api from "./axios";


export const getCRMStats =
async()=>{


const response =
await api.get(

"/crm/stats"

);


return response.data;


};