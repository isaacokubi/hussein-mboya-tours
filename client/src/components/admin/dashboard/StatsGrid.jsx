import { useQuery } from "@tanstack/react-query";
import StatCard from "./Statcard";
import { getDashboardMetrics } from "../../../api/adminApi";
import { firstNumeric, numeric, unwrapData } from "../../../utils/dashboardData";

const number = (value) => numeric(value).toLocaleString();
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

  const metrics = unwrapData(metricsPayload);
  const fallback = unwrapData(stats);
  const source = Object.keys(metrics).length ? metrics : fallback;
  const paymentStats = fallback.paymentStats || {};

  const cards = [
    ["Users", firstNumeric(source.users, fallback.users)],
    ["Customers", firstNumeric(source.customers, fallback.customers)],
    ["Admins", firstNumeric(source.admins, fallback.admins)],
    ["Staff", firstNumeric(source.staff, fallback.staff)],
    ["Guides", firstNumeric(source.guides, fallback.guides)],
    ["Drivers", firstNumeric(source.drivers, fallback.drivers)],
    ["Agents", firstNumeric(source.agents, fallback.agents)],
    ["Approved Agents", firstNumeric(source.approvedAgents, fallback.approvedAgents)],
    ["Vehicles", firstNumeric(source.vehicles, fallback.vehicles)],
    ["Available Vehicles", firstNumeric(source.availableVehicles, fallback.availableVehicles)],
    ["Tours", firstNumeric(source.tours, fallback.tours)],
    ["Destinations", firstNumeric(source.destinations, fallback.destinations)],
    ["Bookings", firstNumeric(source.bookings, fallback.bookings)],
    ["Pending Bookings", firstNumeric(source.pendingBookings, summary.pendingBookings, fallback.pendingBookings)],
    ["Confirmed Bookings", firstNumeric(source.confirmedBookings, summary.confirmedBookings, fallback.confirmedBookings)],
    ["Payments", firstNumeric(source.payments, fallback.payments)],
    ["Completed Payments", firstNumeric(source.completedPayments, paymentStats.completed, fallback.completedPayments)],
    ["Revenue", money(firstNumeric(source.revenue, fallback.revenue), source.revenueCurrency || fallback.revenueCurrency || "KES")],
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(([title, value]) => (
        <StatCard key={title} title={title} value={value} />
      ))}
    </div>
  );
}
