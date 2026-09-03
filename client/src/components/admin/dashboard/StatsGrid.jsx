import StatCard from "./Statcard";
import { firstNumeric, numeric, unwrapData } from "../../../utils/dashboardData";

const number = (value) => numeric(value).toLocaleString();
const money = (value, currency = "KES") => `${currency} ${number(value)}`;

export default function StatsGrid({ stats = {}, summary = {} }) {
  const source = unwrapData(stats);
  const paymentStats = source.paymentStats || {};
  const paymentBreakdownTotal = [paymentStats.completed, paymentStats.pending, paymentStats.failed]
    .reduce((total, value) => total + numeric(value), 0);
  const paymentCount = paymentBreakdownTotal || firstNumeric(source.payments);

  const cards = [
    ["Users", firstNumeric(source.users)],
    ["Customers", firstNumeric(source.customers)],
    ["Staff", firstNumeric(source.staff)],
    ["Guides", firstNumeric(source.guides)],
    ["Drivers", firstNumeric(source.drivers)],
    ["Agents", firstNumeric(source.agents)],
    ["Approved Agents", firstNumeric(source.approvedAgents)],
    ["Vehicles", firstNumeric(source.vehicles)],
    ["Available Vehicles", firstNumeric(source.availableVehicles)],
    ["Tours", firstNumeric(source.tours)],
    ["Destinations", firstNumeric(source.destinations)],
    ["Bookings", firstNumeric(source.bookings)],
    ["Pending Bookings", firstNumeric(source.pendingBookings, summary.pendingBookings)],
    ["Confirmed Bookings", firstNumeric(source.confirmedBookings, summary.confirmedBookings)],
    ["Payments", paymentCount],
    ["Completed Payments", firstNumeric(paymentStats.completed, source.completedPayments)],
    ["Revenue", money(firstNumeric(source.revenue), source.revenueCurrency || "KES")],
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {cards.map(([title, value]) => (
        <StatCard key={title} title={title} value={value} />
      ))}
    </div>
  );
}
