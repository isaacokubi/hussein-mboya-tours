import api from "./axios";

export const getHeroSlides = async () => {
  const response = await api.get("/hero");
  const slides = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.slides)
      ? response.data.slides
      : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

  // Do not substitute another company's branding/content when a tenant has
  // no configured hero. The public homepage should reflect only this tenant.
  return slides;
};

export const getAll = async () => {
  const { data } = await api.get("/hero");
  return data;
};
