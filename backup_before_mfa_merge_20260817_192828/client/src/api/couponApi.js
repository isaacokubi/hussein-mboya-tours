import api from "./axios";

export const getCoupons = async () => {
  const {data}=await api.get("/admin/coupons");
  return data;
};

export const createCoupon = async(payload)=>{
  const {data}=await api.post("/admin/coupons",payload);
  return data;
};

export const updateCoupon = async(id,payload)=>{
  const {data}=await api.put(`/admin/coupons/${id}`,payload);
  return data;
};

export const deleteCoupon = async(id)=>{
  const {data}=await api.delete(`/admin/coupons/${id}`);
  return data;
};
