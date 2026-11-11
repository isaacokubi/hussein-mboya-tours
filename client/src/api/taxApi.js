/**
 * Purpose: tax Api client application module. Main declarations: unwrap, getTaxRules, initializeTaxRules, saveTaxRule, calculateTax.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";
// Declare unwrap for use by the surrounding module or function.
const unwrap = (response) => response?.data?.data ?? response?.data ?? {};
// Declare getTaxRules for use by the surrounding module or function.
export const getTaxRules = async () => unwrap(await api.get("/admin/tax/rules"));
// Declare initializeTaxRules for use by the surrounding module or function.
export const initializeTaxRules = async () => unwrap(await api.post("/admin/tax/rules/initialize"));
// Declare saveTaxRule for use by the surrounding module or function.
export const saveTaxRule = async (code, payload) => unwrap(await api.put(`/admin/tax/rules/${encodeURIComponent(code)}`, payload));
// Declare calculateTax for use by the surrounding module or function.
export const calculateTax = async (payload) => unwrap(await api.post("/admin/tax/calculate", payload));
