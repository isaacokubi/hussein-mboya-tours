import { QueryClient } from "@tanstack/react-query";

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
      refetchOnMount: false,
    },
  },
});

// API mutations announce data changes globally for legacy dashboard listeners.
// Mark cached data stale without triggering a simultaneous refetch storm;
// active screens can refresh explicitly and the next navigation loads only
// the resources it actually needs.
if (typeof window !== "undefined") {
  window.addEventListener("dashboard:data-changed", () => {
    void queryClient.invalidateQueries({ refetchType: "none" });
  });
}
