/**
 * Purpose: finance Compliance Api client application module. Main declarations: getTaxProfile, saveTaxProfile, getEtimsCredentialStatus, saveEtimsCredentials, getFinanceComplianceSummary.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";
// Declare getTaxProfile for use by the surrounding module or function.
export const getTaxProfile = async () => (await api.get("/finance-compliance/tax-profile")).data;
// Declare saveTaxProfile for use by the surrounding module or function.
export const saveTaxProfile = async (data) => (await api.put("/finance-compliance/tax-profile", data)).data;
// Declare getEtimsCredentialStatus for use by the surrounding module or function.
export const getEtimsCredentialStatus = async (environment = "sandbox") => (await api.get("/finance-compliance/etims/credentials", { params: { environment } })).data;
// Declare saveEtimsCredentials for use by the surrounding module or function.
export const saveEtimsCredentials = async (data) => (await api.put("/finance-compliance/etims/credentials", data)).data;
// Declare getFinanceComplianceSummary for use by the surrounding module or function.
export const getFinanceComplianceSummary = async () => (await api.get("/finance-compliance/compliance-summary")).data;
// Declare getCreditDebitNotes for use by the surrounding module or function.
export const getCreditDebitNotes = async () => (await api.get("/finance-compliance/notes")).data;
// Declare createCreditDebitNote for use by the surrounding module or function.
export const createCreditDebitNote = async (data) => (await api.post("/finance-compliance/notes", data)).data;
// Declare queueCreditDebitNote for use by the surrounding module or function.
export const queueCreditDebitNote = async (id) => (await api.post(`/finance-compliance/notes/${id}/queue`)).data;
// Declare getEtimsSubmissions for use by the surrounding module or function.
export const getEtimsSubmissions = async (params = {}) => (await api.get("/finance-compliance/etims/submissions", { params })).data;
