import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { CartProvider } from "./context/CartContext";

import "./index.css";
import "./utils/syncPickupTimeWithTravelDate";

/*
 * The API/database is the single source of truth for dashboard data.
 * Every successful React Query mutation (create/update/delete/patch) therefore
 * invalidates all cached queries. This prevents deleted or edited records from
 * remaining visible in another dashboard or public page because of a stale
 * client cache.
 */
let queryClient;

const mutationCache = new MutationCache({
  onSuccess: () => {
    if (!queryClient) return;

    queryClient.invalidateQueries();

    if (import.meta.env.DEV) {
      console.debug("Mutation succeeded; dashboard queries invalidated");
    }
  },
});

queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      retry: 1,
      // Do not keep server collections in a five-minute client cache.
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
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
            <App />
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("VITE_SOCKET_URL =", import.meta.env.VITE_SOCKET_URL);
