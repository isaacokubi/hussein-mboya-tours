import { TenantProvider } from './context/TenantContext';
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { socketUrl } from "./api/apiUrls";
import { SettingsProvider } from "./context/SettingsContext";
import { CartProvider } from "./context/CartContext";
import "./index.css";
import "./utils/syncPickupTimeWithTravelDate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

// A successful write marks cached resources stale but does not eagerly reload
// every active dashboard. Screens refresh their own keys; route navigation
// fetches only the resources needed by the destination.
if (typeof window !== "undefined") {
  window.addEventListener("dashboard:data-changed", () => {
    void queryClient.invalidateQueries({ refetchType: "none" });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <TenantProvider><App /></TenantProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

if (import.meta.env.DEV) {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  console.log("Effective API URL =", apiUrl);
  console.log("Effective Socket URL =", socketUrl);
}
