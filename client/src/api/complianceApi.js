import api from "./axios";

export const getComplianceRecords = async () => (await api.get("/admin/compliance")).data;
export const getComplianceSummary = async () => (await api.get("/admin/compliance/summary")).data;
export const saveComplianceRecord = async (type, data) => (await api.put(`/admin/compliance/${type}`, { ...data, type })).data;
export const queueEtimsInvoice = async (invoiceId) => (await api.post(`/admin/compliance/etims/invoices/${invoiceId}/queue`)).data;
