import api from "./axios";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const getSuppliers = async () => unwrap(await api.get("/admin/operations/module/suppliers"));
export const getPurchaseOrders = async () => unwrap(await api.get("/admin/operations/module/purchase-orders"));
export const getTourCosts = async () => unwrap(await api.get("/admin/operations/module/tour-costs"));
export const getSupplierPayables = async () => unwrap(await api.get("/admin/operations/module/supplier-payables"));
export const getCorporateAccounts = async () => unwrap(await api.get("/admin/operations/module/corporate-accounts"));
export const getResourceConflicts = async () => unwrap(await api.get("/admin/operations/module/resource-conflicts"));
