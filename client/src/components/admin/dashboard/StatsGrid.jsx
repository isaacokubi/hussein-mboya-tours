import { useQuery } from "@tanstack/react-query";
import StatCard from "./Statcard";
import { getDashboardMetrics } from "../../../api/adminApi";

const number = (value) => Number(value ?? 0).toLocaleString();
const money = (value, currency = "KES") => `${currency} ${number(value)}`;

export default function StatsGrid({ stats = {}, summary = {} }) {
  const { data: metricsPayload } = useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: getDashboardMetrics,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const metrics = metricsPayload?.data || {};
  const source = Object.keys(metrics).length ? metrics : stats;

  const cards = [
    ["Users", number(source.users)],
    ["Customers", number(source.customers)],
    ["Admins", number(source.admins)],
    ["Staff", number(source.staff)],
    ["Guides", number(source.guides)],
    ["Drivers", number(source.drivers)],
    ["Agents", number(source.agents)],
    ["Approved Agents", number(source.approvedAgents)],
    ["Vehicles", number(source.vehicles)],
    ["Available Vehicles", number(source.availableVehicles)],
    ["Tours", number(source.tours)],
    ["Destinations", number(source.destinations)],
    ["Bookings", number(source.bookings)],
    ["Pending Bookings", number(source.pendingBookings ?? summary.pendingBookings)],
    ["Confirmed Bookings", number(source.confirmedBookings ?? summary.confirmedBookings)],
    ["Payments", number(source.payments)],
    ["Completed Payments", number(source.completedPayments)],
    ["Revenue", money(source.revenue, source.revenueCurrency || "KES")],
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(([title, value]) => (
        <StatCard key={title} title={title} value={value} />
      ))}
    </div>
  );
}
