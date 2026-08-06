

import api from "./axios";


export const getFinanceStats =
async()=>{

const {data}=await api.get(
"/admin/finance"
);

return data;

};



export const requestRefund =
async(id,payload)=>{


const {data}=await api.post(

`/admin/bookings/${id}/refund`,

payload

);


return data;

};



export const processRefund =
async(id,payload)=>{


const {data}=await api.put(

`/admin/refunds/${id}/process`,

payload

);


return data;

};


