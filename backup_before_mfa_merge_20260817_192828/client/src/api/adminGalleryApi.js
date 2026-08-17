import api from "./axios";


export const getAdminGallery = async () => {
  const {data} = await api.get("/admin/gallery");
  return data.gallery || [];
};


export const createGallery = async(payload)=>{
  const {data}=await api.post(
    "/admin/gallery",
    payload
  );
  return data;
};


export const updateGallery = async(id,payload)=>{
  const {data}=await api.put(
    `/admin/gallery/${id}`,
    payload
  );
  return data;
};


export const deleteGallery = async(id)=>{
  const {data}=await api.delete(
    `/admin/gallery/${id}`
  );
  return data;
};
