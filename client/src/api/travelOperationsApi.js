import api from "./axios";

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

export const getTravelOperations = async (params = {}) => unwrap(await api.get("/operations", { params }));
export const createTravelOperation = async (payload) => unwrap(await api.post("/operations", payload));
export const updateTravelOperation = async (id, payload) => unwrap(await api.patch(`/operations/${id}`, payload));
export const deleteTravelOperation = async (id) => unwrap(await api.delete(`/operations/${id}`));
export const getTravelRules = async () => unwrap(await api.get("/operations/rules/list"));
export const createTravelRule = async (payload) => unwrap(await api.post("/operations/rules", payload));
export const updateTravelRule = async (id, payload) => unwrap(await api.patch(`/operations/rules/${id}`, payload));
export const deleteTravelRule = async (id) => unwrap(await api.delete(`/operations/rules/${id}`));

export const getOperationalAssets = async (params = {}) => unwrap(await api.get("/operational-assets", { params }));
export const createOperationalAsset = async (payload) => unwrap(await api.post("/operational-assets", payload));
export const updateOperationalAsset = async (id, payload) => unwrap(await api.patch(`/operational-assets/${id}`, payload));
export const deleteOperationalAsset = async (id) => unwrap(await api.delete(`/operational-assets/${id}`));
