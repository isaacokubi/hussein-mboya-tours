import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| ATTACH JWT TOKEN AUTOMATICALLY
|--------------------------------------------------------------------------
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      const requestUrl = String(error.config?.url || "");
      const isLoginRequest = requestUrl.includes("/auth/login");

      // Only clear an existing session when a protected request proves
      // that its token is no longer accepted. Avoid redirect loops and
      // avoid turning an ordinary unauthenticated request into a logout.
      if (token && !isLoginRequest) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;