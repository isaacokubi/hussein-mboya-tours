/**
 * Purpose: query Client client application module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { QueryClient } from "@tanstack/react-query";

// Declare queryClient for use by the surrounding module or function.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep recently loaded resources warm during navigation. Individual
      // high-volatility queries can override these defaults.
      staleTime: 30_000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
  },
});

// API mutations announce data changes globally for legacy dashboard listeners.
// Mark cached data stale without triggering a simultaneous refetch storm;
// active screens can refresh explicitly and the next navigation loads only
// the resources it actually needs.
// Check the condition (typeof window !== "undefined") and run the matching branch.
if (typeof window !== "undefined") {
  // Perform the side effect or state update expressed on the following line.
  window.addEventListener("dashboard:data-changed", () => {
    // Perform the side effect or state update expressed on the following line.
    void queryClient.invalidateQueries({ refetchType: "none" });
  });
}
