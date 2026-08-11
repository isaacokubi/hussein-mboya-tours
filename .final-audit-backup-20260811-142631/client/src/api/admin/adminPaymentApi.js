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



const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportPaymentsCSV = async (params = {}) => {
  const { data } = await api.get("/admin/payments/export/csv", {
    params,
    responseType: "blob",
  });
  downloadBlob(data, "payments-report.csv");
};

export const exportPaymentsPDF = async (params = {}) => {
  const { data } = await api.get("/admin/payments/export/pdf", {
    params,
    responseType: "blob",
  });
  downloadBlob(data, "payments-report.pdf");
};
