/**
 * Purpose: accommodation Inventory Api client application module. Main declarations: unwrap, getAccommodationInventory, createAccommodationInventory, updateAccommodationInventory.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";
// Declare unwrap for use by the surrounding module or function.
const unwrap = (response) => response?.data?.data ?? response?.data ?? [];
// Declare getAccommodationInventory for use by the surrounding module or function.
export const getAccommodationInventory = async () => unwrap(await api.get("/admin/operations/accommodation-inventory"));
// Declare createAccommodationInventory for use by the surrounding module or function.
export const createAccommodationInventory = async (payload) => unwrap(await api.post("/admin/operations/accommodation-inventory", payload));
// Declare updateAccommodationInventory for use by the surrounding module or function.
export const updateAccommodationInventory = async (id, payload) => unwrap(await api.patch(`/admin/operations/accommodation-inventory/${id}`, payload));
