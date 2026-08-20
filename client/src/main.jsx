import React from "react";
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

/*
 * Dashboard data must never become a second source of truth.
 * Every successful create/update/delete mutation is followed by a global
 * query invalidation so active dashboards, public pages and related widgets
 * refetch the authoritative state from the API/database.
 */
const mutationCache = new MutationCache({
  onSuccess: (_data, _variables, _context, mutation) => {
    const queryClient = mutationCache.queryClient;
    if (!queryClient) return;

    // Mutations made through React Query are considered committed only after
    // their API request resolves successfully. Invalidate every query here so
    // we do not depend on individual pages remembering every related query key.
    queryClient.invalidateQueries();

    if (import.meta.env.DEV) {
      console.debug("Mutation succeeded; dashboard queries invalidated", {
        mutationKey: mutation.options?.mutationKey,
      });
    }
  },
});

const queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      retry: 1,
      // Dashboard/public collections are server-authoritative. Do not keep
      // deleted or edited records in a five-minute client cache.
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

// TanStack Query exposes the client through the cache after construction.
mutationCache.queryClient = queryClient;

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
