

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


/* FINANCE REPORTS */
export const getReports = async (params = {}) => {
  const { data } = await api.get('/admin/finance/reports', { params });
  return data;
};

/* MPESA / PAYMENT TRANSACTIONS */
export const getMpesaTransactions = async (params = {}) => {
  const { data } = await api.get('/admin/finance/transactions', { params });
  return data;
};
