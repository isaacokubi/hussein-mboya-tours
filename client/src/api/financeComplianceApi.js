import api from "./axios";

export const getTaxProfile = async () => (await api.get("/finance-compliance/tax-profile")).data;
export const saveTaxProfile = async (data) => (await api.put("/finance-compliance/tax-profile", data)).data;
export const getFinanceComplianceSummary = async () => (await api.get("/finance-compliance/compliance-summary")).data;
export const getCreditDebitNotes = async () => (await api.get("/finance-compliance/notes")).data;
export const createCreditDebitNote = async (data) => (await api.post("/finance-compliance/notes", data)).data;
export const queueCreditDebitNote = async (id) => (await api.post(`/finance-compliance/notes/${id}/queue`)).data;
export const getEtimsSubmissions = async (params = {}) => (await api.get("/finance-compliance/etims/submissions", { params })).data;
