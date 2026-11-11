/**
 * Purpose: operations Module Api client application module. Main declarations: unwrap, getSuppliers, createSupplier, updateSupplier, getPurchaseOrders.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare unwrap for use by the surrounding module or function.
const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

// Declare getSuppliers for use by the surrounding module or function.
export const getSuppliers = async () => unwrap(await api.get("/admin/operations/module/suppliers"));
// Declare createSupplier for use by the surrounding module or function.
export const createSupplier = async (payload) => unwrap(await api.post("/admin/operations/module/suppliers", payload));
// Declare updateSupplier for use by the surrounding module or function.
export const updateSupplier = async (id, payload) => unwrap(await api.patch(`/admin/operations/module/suppliers/${id}`, payload));
// Declare getPurchaseOrders for use by the surrounding module or function.
export const getPurchaseOrders = async () => unwrap(await api.get("/admin/operations/module/purchase-orders"));
// Declare createPurchaseOrder for use by the surrounding module or function.
export const createPurchaseOrder = async (payload) => unwrap(await api.post("/admin/operations/module/purchase-orders", payload));
// Declare transitionPurchaseOrder for use by the surrounding module or function.
export const transitionPurchaseOrder = async (id, status) => unwrap(await api.patch(`/admin/operations/module/purchase-orders/${id}/status`, { status }));
// Declare getTourCosts for use by the surrounding module or function.
export const getTourCosts = async () => unwrap(await api.get("/admin/operations/module/tour-costs"));
// Declare createTourCost for use by the surrounding module or function.
export const createTourCost = async (payload) => unwrap(await api.post("/admin/operations/module/tour-costs", payload));
// Declare getTourProfitability for use by the surrounding module or function.
export const getTourProfitability = async (tourId) => unwrap(await api.get(`/admin/operations/module/tour-costs/profitability/${tourId}`));
// Declare getSupplierPayables for use by the surrounding module or function.
export const getSupplierPayables = async () => unwrap(await api.get("/admin/operations/module/supplier-payables"));
// Declare createSupplierPayable for use by the surrounding module or function.
export const createSupplierPayable = async (payload) => unwrap(await api.post("/admin/operations/module/supplier-payables", payload));
// Declare paySupplierPayable for use by the surrounding module or function.
export const paySupplierPayable = async (id, amount, paymentReference) => unwrap(await api.post(`/admin/operations/module/supplier-payables/${id}/pay`, { amount, paymentReference }));
// Declare getCorporateAccounts for use by the surrounding module or function.
export const getCorporateAccounts = async () => unwrap(await api.get("/admin/operations/module/corporate-accounts"));
// Declare createCorporateAccount for use by the surrounding module or function.
export const createCorporateAccount = async (payload) => unwrap(await api.post("/admin/operations/module/corporate-accounts", payload));
// Declare reconcileCorporateAccount for use by the surrounding module or function.
export const reconcileCorporateAccount = async (id) => unwrap(await api.post(`/admin/operations/module/corporate-accounts/${id}/reconcile`));
// Declare getResourceConflicts for use by the surrounding module or function.
export const getResourceConflicts = async () => unwrap(await api.get("/admin/operations/module/resource-conflicts"));
