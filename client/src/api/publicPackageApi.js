import api from "./axios";

export async function getPublicPackages() {
  const response = await api.get("/packages");
  return Array.isArray(response.data?.packages) ? response.data.packages : [];
}
