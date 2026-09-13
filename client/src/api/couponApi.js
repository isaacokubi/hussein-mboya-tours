import api from "./axios";

const normalizeCouponResponse = (data) => {
  if (Array.isArray(data)) return { coupons: data };
  if (Array.isArray(data?.coupons)) return data;
  if (Array.isArray(data?.data?.coupons)) return data.data;
  return { ...(data || {}), coupons: [] };
};

export const getCoupons = async () => {
  const { data } = await api.get("/admin/coupons", {
    params: { _ts: Date.now() },
  });
  return normalizeCouponResponse(data);
};

export const createCoupon = async (payload) => {
  const { data } = await api.post("/admin/coupons", payload);
  return data;
};

export const updateCoupon = async (id, payload) => {
  const { data } = await api.put(`/admin/coupons/${id}`, payload);
  return data;
};

export const deleteCoupon = async (id) => {
  const { data } = await api.delete(`/admin/coupons/${id}`);
  return data;
};
