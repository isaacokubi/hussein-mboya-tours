import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

// A single mutation event invalidates every dashboard/query cache. This keeps
// admin, SuperAdmin, agent, guide, driver, Tour Manager and customer dashboards
// synchronized after creates, updates and deletes without coupling pages.
if (typeof window !== "undefined") {
  window.addEventListener("dashboard:data-changed", () => {
    queryClient.invalidateQueries();
  });
}
