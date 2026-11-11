/**
 * Purpose: finance Lifecycle Api client application module. Main declarations: getCreditDebitNotes, createCreditDebitNote, issueCreditDebitNote, cancelCreditDebitNote, getPaymentLinks.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getCreditDebitNotes for use by the surrounding module or function.
export const getCreditDebitNotes = async () => (await api.get("/admin/credit-debit-notes")).data;
// Declare createCreditDebitNote for use by the surrounding module or function.
export const createCreditDebitNote = async (payload) => (await api.post("/admin/credit-debit-notes", payload)).data;
// Declare issueCreditDebitNote for use by the surrounding module or function.
export const issueCreditDebitNote = async (id) => (await api.post(`/admin/credit-debit-notes/${id}/issue`)).data;
// Declare cancelCreditDebitNote for use by the surrounding module or function.
export const cancelCreditDebitNote = async (id) => (await api.post(`/admin/credit-debit-notes/${id}/cancel`)).data;
// Declare getPaymentLinks for use by the surrounding module or function.
export const getPaymentLinks = async () => (await api.get("/admin/payment-links")).data;
// Declare createPaymentLink for use by the surrounding module or function.
export const createPaymentLink = async (payload) => (await api.post("/admin/payment-links", payload)).data;
// Declare cancelPaymentLink for use by the surrounding module or function.
export const cancelPaymentLink = async (id) => (await api.post(`/admin/payment-links/${id}/cancel`)).data;
// Declare getPublicPaymentLink for use by the surrounding module or function.
export const getPublicPaymentLink = async (token) => (await api.get(`/admin/payment-links/public/${encodeURIComponent(token)}`)).data;
