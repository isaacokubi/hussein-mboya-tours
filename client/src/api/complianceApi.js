/**
 * Purpose: compliance Api client application module. Main declarations: getComplianceRecords, getComplianceSummary, saveComplianceRecord, queueEtimsInvoice.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getComplianceRecords for use by the surrounding module or function.
export const getComplianceRecords = async () => (await api.get("/admin/compliance")).data;
// Declare getComplianceSummary for use by the surrounding module or function.
export const getComplianceSummary = async () => (await api.get("/admin/compliance/summary")).data;
// Declare saveComplianceRecord for use by the surrounding module or function.
export const saveComplianceRecord = async (type, data) => (await api.put(`/admin/compliance/${type}`, { ...data, type })).data;
// Declare queueEtimsInvoice for use by the surrounding module or function.
export const queueEtimsInvoice = async (invoiceId) => (await api.post(`/admin/compliance/etims/invoices/${invoiceId}/queue`)).data;
