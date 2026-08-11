import { useQuery } from "@tanstack/react-query";
import { fetchAgentDashboard } from "../api/agentApi";

export const useAgentDashboard = () => {
  const query = useQuery({
    queryKey: ["agent-dashboard"],
    queryFn: fetchAgentDashboard,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const payload = query.data?.data || query.data || {};
  const statistics = payload.statistics || payload.stats || {};

  return {
    ...query,
    dashboard: payload,
    stats: {
      ...statistics,
      assignedTours: statistics.assignedTours ?? statistics.bookings ?? 0,
      upcomingTours: statistics.upcomingTours ?? statistics.pendingBookings ?? 0,
    },
    bookings: payload.recentBookings || payload.bookings || [],
    customers: payload.customers || [],
    revenue: statistics.totalSales || payload.revenue || 0,
  };
};
