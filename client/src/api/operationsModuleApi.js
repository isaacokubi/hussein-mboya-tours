import api from "./axios";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const getSuppliers = async () => unwrap(await api.get("/admin/operations/module/suppliers"));
export const createSupplier = async (payload) => unwrap(await api.post("/admin/operations/module/suppliers", payload));
export const updateSupplier = async (id, payload) => unwrap(await api.patch(`/admin/operations/module/suppliers/${id}`, payload));
export const getPurchaseOrders = async () => unwrap(await api.get("/admin/operations/module/purchase-orders"));
export const createPurchaseOrder = async (payload) => unwrap(await api.post("/admin/operations/module/purchase-orders", payload));
export const transitionPurchaseOrder = async (id, status) => unwrap(await api.patch(`/admin/operations/module/purchase-orders/${id}/status`, { status }));
export const getTourCosts = async () => unwrap(await api.get("/admin/operations/module/tour-costs"));
export const createTourCost = async (payload) => unwrap(await api.post("/admin/operations/module/tour-costs", payload));
export const getTourProfitability = async (tourId) => unwrap(await api.get(`/admin/operations/module/tour-costs/profitability/${tourId}`));
export const getSupplierPayables = async () => unwrap(await api.get("/admin/operations/module/supplier-payables"));
export const createSupplierPayable = async (payload) => unwrap(await api.post("/admin/operations/module/supplier-payables", payload));
export const paySupplierPayable = async (id, amount, paymentReference) => unwrap(await api.post(`/admin/operations/module/supplier-payables/${id}/pay`, { amount, paymentReference }));
export const getCorporateAccounts = async () => unwrap(await api.get("/admin/operations/module/corporate-accounts"));
export const createCorporateAccount = async (payload) => unwrap(await api.post("/admin/operations/module/corporate-accounts", payload));
export const reconcileCorporateAccount = async (id) => unwrap(await api.post(`/admin/operations/module/corporate-accounts/${id}/reconcile`));
export const getResourceConflicts = async () => unwrap(await api.get("/admin/operations/module/resource-conflicts"));
