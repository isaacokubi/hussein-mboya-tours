import api from "./axios";
export const getOperationsOverview = async () => (await api.get("/admin/operations")).data;
