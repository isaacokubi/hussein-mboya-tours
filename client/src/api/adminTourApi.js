import axios from "axios";

// ============================================================
// AXIOS INSTANCE
// ============================================================

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ============================================================
// AUTH TOKEN INTERCEPTOR
// ============================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

// ============================================================
// CREATE TOUR
// ============================================================

export const createTour = async (formData) => {
  const { data } = await API.post(
    "/admin/tours",

    formData,

    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};

// ============================================================
// GET ADMIN TOURS
// ============================================================

export const getAdminTours = async () => {
  const { data } = await API.get("/admin/tours");

  return data;
};

// ============================================================
// UPDATE TOUR
// ============================================================

export const updateTour = async (
  id,

  formData,
) => {
  const { data } = await API.put(
    `/admin/tours/${id}`,

    formData,

    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};

// ============================================================
// DELETE TOUR
// ============================================================

export const deleteTour = async (id) => {
  const { data } = await API.delete(`/admin/tours/${id}`);

  return data;
};

export default API;
