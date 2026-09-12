import { TenantProvider } from './context/TenantContext';
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { CartProvider } from "./context/CartContext";
import "./index.css";
import "./utils/syncPickupTimeWithTravelDate";

let queryClient;

const mutationCache = new MutationCache({
  onSuccess: () => {
    if (!queryClient) return;
    queryClient.invalidateQueries();
    if (import.meta.env.DEV) console.debug("Mutation succeeded; dashboard queries invalidated");
  },
});

queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

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
  const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
  console.log("Effective API URL =", apiUrl);
  console.log("Effective Socket URL =", socketUrl);
}
