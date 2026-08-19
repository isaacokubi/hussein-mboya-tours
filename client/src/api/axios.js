import axios from "axios";

/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
|
| During local development the project should talk directly to the local
| Express server. A stale ngrok URL can otherwise cause the customer
| dashboard to fail before React even receives /auth/me.
|
| Production/staging URLs supplied through VITE_API_URL are still respected.
|--------------------------------------------------------------------------
*/

const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();

const isLocalBrowser =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

const isNgrokUrl = /ngrok(-free)?\.dev/i.test(configuredApiUrl);

const baseURL =
  isLocalBrowser && (!configuredApiUrl || isNgrokUrl)
    ? "http://localhost:5000/api"
    : configuredApiUrl || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    // Any successful write operation can change dashboard statistics.
    // Broadcast once here so every dashboard/query cache can refresh without
    // every individual CRUD page needing custom synchronization code.
    const method = String(response.config?.method || "").toLowerCase();
    if (typeof window !== "undefined" && ["post", "put", "patch", "delete"].includes(method)) {
      window.dispatchEvent(new CustomEvent("dashboard:data-changed", {
        detail: {
          method,
          url: response.config?.url || "",
        },
      }));
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("401 SERVER RESPONSE", error.response.data);
    }

    return Promise.reject(error);
  },
);

export { baseURL };
export default api;
