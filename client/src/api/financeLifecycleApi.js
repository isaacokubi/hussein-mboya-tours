import api from "./axios";

export const getCreditDebitNotes = async () => (await api.get("/admin/credit-debit-notes")).data;
export const createCreditDebitNote = async (payload) => (await api.post("/admin/credit-debit-notes", payload)).data;
export const issueCreditDebitNote = async (id) => (await api.post(`/admin/credit-debit-notes/${id}/issue`)).data;
export const cancelCreditDebitNote = async (id) => (await api.post(`/admin/credit-debit-notes/${id}/cancel`)).data;
export const getPaymentLinks = async () => (await api.get("/admin/payment-links")).data;
export const createPaymentLink = async (payload) => (await api.post("/admin/payment-links", payload)).data;
export const cancelPaymentLink = async (id) => (await api.post(`/admin/payment-links/${id}/cancel`)).data;
export const getPublicPaymentLink = async (token) => (await api.get(`/admin/payment-links/public/${encodeURIComponent(token)}`)).data;
