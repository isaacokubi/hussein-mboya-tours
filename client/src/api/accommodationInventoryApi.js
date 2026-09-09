import api from "./axios";
const unwrap = (response) => response?.data?.data ?? response?.data ?? [];
export const getAccommodationInventory = async () => unwrap(await api.get("/admin/operations/accommodation-inventory"));
export const createAccommodationInventory = async (payload) => unwrap(await api.post("/admin/operations/accommodation-inventory", payload));
export const updateAccommodationInventory = async (id, payload) => unwrap(await api.patch(`/admin/operations/accommodation-inventory/${id}`, payload));
