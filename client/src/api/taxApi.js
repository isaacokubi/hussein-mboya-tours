import api from "./axios";
const unwrap = (response) => response?.data?.data ?? response?.data ?? {};
export const getTaxRules = async () => unwrap(await api.get("/admin/tax/rules"));
export const initializeTaxRules = async () => unwrap(await api.post("/admin/tax/rules/initialize"));
export const saveTaxRule = async (code, payload) => unwrap(await api.put(`/admin/tax/rules/${encodeURIComponent(code)}`, payload));
export const calculateTax = async (payload) => unwrap(await api.post("/admin/tax/calculate", payload));
