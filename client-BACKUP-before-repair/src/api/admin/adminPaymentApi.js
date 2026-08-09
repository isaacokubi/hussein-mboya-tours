// client/src/api/admin/adminPaymentApi.js

import api from "../axios";


/*
|--------------------------------------------------------------------------
| ADMIN PAYMENTS
|--------------------------------------------------------------------------
*/


export const getAdminPayments = async (params = {}) => {

  const { data } = await api.get(
    "/admin/payments",
    {
      params,
    }
  );

  return data;

};





export const getPaymentStats = async () => {

  const { data } = await api.get(
    "/admin/payments/stats"
  );

  return data;

};





export const getPaymentAnalytics = async (params = {}) => {

  const { data } = await api.get(
    "/admin/payments/analytics",
    {
      params,
    }
  );

  return data;

};





export const updatePaymentStatus = async (
  id,
  payload
) => {

  const { data } = await api.patch(
    `/admin/payments/${id}`,
    payload
  );

  return data;

};


export const refundPayment =
async(id)=>{

const res =
await api.patch(
`/admin/payments/${id}/refund`
);

return res.data;

};



export const getPaymentReconciliation =
async()=>{

const res =
await api.get(
"/admin/payments/reconciliation"
);

return res.data;

};



export const exportPaymentsCSV = ()=>{

window.open(
`${import.meta.env.VITE_API_URL}/admin/payments/export/csv`,
"_blank"
);

};


export const exportPaymentsPDF = ()=>{

window.open(
`${import.meta.env.VITE_API_URL}/admin/payments/export/pdf`,
"_blank"
);

};

