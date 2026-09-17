import api from "./axios";

const unwrapDestinations = (data) =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.destinations)
        ? data.destinations
        : [];

export const getFeaturedDestinations = async () => {
  const response = await api.get("/destinations/featured");
  return unwrapDestinations(response.data);
};

export const getDestinations = async () => {
  const response = await api.get("/destinations");
  return unwrapDestinations(response.data);
};

export const getDestinationBySlug = async (slug) => {
  const response = await api.get(`/destinations/${slug}`);
  return response.data?.destination || response.data?.data || null;
};
