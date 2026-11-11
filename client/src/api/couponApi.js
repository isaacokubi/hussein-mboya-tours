/**
 * Purpose: coupon Api client application module. Main declarations: normalizeCouponResponse, getCoupons, createCoupon, updateCoupon, deleteCoupon.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare normalizeCouponResponse for use by the surrounding module or function.
const normalizeCouponResponse = (data) => {
  // Check the condition (Array.isArray(data)) and run the matching branch.
  if (Array.isArray(data)) return { coupons: data };
  // Check the condition (Array.isArray(data?.coupons)) and run the matching branch.
  if (Array.isArray(data?.coupons)) return data;
  // Check the condition (Array.isArray(data?.data?.coupons)) and run the matching branch.
  if (Array.isArray(data?.data?.coupons)) return data.data;
  // Return the object assembled below to the caller.
  return { ...(data || {}), coupons: [] };
};

// Declare getCoupons for use by the surrounding module or function.
export const getCoupons = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/coupons", {
    params: { _ts: Date.now() },
  });
  // Return the result of normalizeCouponResponse() to the caller.
  return normalizeCouponResponse(data);
};

// Declare createCoupon for use by the surrounding module or function.
export const createCoupon = async (payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post("/admin/coupons", payload);
  // Return the value of data to the caller.
  return data;
};

// Declare updateCoupon for use by the surrounding module or function.
export const updateCoupon = async (id, payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/admin/coupons/${id}`, payload);
  // Return the value of data to the caller.
  return data;
};

// Declare deleteCoupon for use by the surrounding module or function.
export const deleteCoupon = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(`/admin/coupons/${id}`);
  // Return the value of data to the caller.
  return data;
};
