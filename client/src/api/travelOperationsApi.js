/**
 * Purpose: travel Operations Api client application module. Main declarations: unwrap, getTravelOperations, createTravelOperation, updateTravelOperation, deleteTravelOperation.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare unwrap for use by the surrounding module or function.
const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

// Declare getTravelOperations for use by the surrounding module or function.
export const getTravelOperations = async (params = {}) => unwrap(await api.get("/operations", { params }));
// Declare createTravelOperation for use by the surrounding module or function.
export const createTravelOperation = async (payload) => unwrap(await api.post("/operations", payload));
// Declare updateTravelOperation for use by the surrounding module or function.
export const updateTravelOperation = async (id, payload) => unwrap(await api.patch(`/operations/${id}`, payload));
// Declare deleteTravelOperation for use by the surrounding module or function.
export const deleteTravelOperation = async (id) => unwrap(await api.delete(`/operations/${id}`));
// Declare getTravelRules for use by the surrounding module or function.
export const getTravelRules = async () => unwrap(await api.get("/operations/rules/list"));
// Declare createTravelRule for use by the surrounding module or function.
export const createTravelRule = async (payload) => unwrap(await api.post("/operations/rules", payload));
// Declare updateTravelRule for use by the surrounding module or function.
export const updateTravelRule = async (id, payload) => unwrap(await api.patch(`/operations/rules/${id}`, payload));
// Declare deleteTravelRule for use by the surrounding module or function.
export const deleteTravelRule = async (id) => unwrap(await api.delete(`/operations/rules/${id}`));

// Declare getOperationalAssets for use by the surrounding module or function.
export const getOperationalAssets = async (params = {}) => unwrap(await api.get("/operational-assets", { params }));
// Declare createOperationalAsset for use by the surrounding module or function.
export const createOperationalAsset = async (payload) => unwrap(await api.post("/operational-assets", payload));
// Declare updateOperationalAsset for use by the surrounding module or function.
export const updateOperationalAsset = async (id, payload) => unwrap(await api.patch(`/operational-assets/${id}`, payload));
// Declare deleteOperationalAsset for use by the surrounding module or function.
export const deleteOperationalAsset = async (id) => unwrap(await api.delete(`/operational-assets/${id}`));
