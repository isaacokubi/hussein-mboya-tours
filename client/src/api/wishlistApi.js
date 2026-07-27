import api from "./axios";

export const getWishlist = async () => {
  const res = await api.get("/wishlist");

  return res.data;
};

export const addWishlist = async (tourId) => {
  const res = await api.post("/wishlist", {
    tourId,
  });

  return res.data;
};

export const removeWishlist = async (tourId) => {
  const res = await api.delete(`/wishlist/${tourId}`);

  return res.data;
};
