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

  const cards = {
    users: ["Users", firstNumeric(source.users)],
    customers: ["Customers", firstNumeric(source.customers)],
    staff: ["Staff", firstNumeric(source.staff)],
    guides: ["Guides", firstNumeric(source.guides)],
    drivers: ["Drivers", firstNumeric(source.drivers)],
    agents: ["Agents", firstNumeric(source.agents)],
    approvedAgents: ["Approved Agents", firstNumeric(source.approvedAgents)],
    vehicles: ["Vehicles", firstNumeric(source.vehicles)],
    availableVehicles: ["Available Vehicles", firstNumeric(source.availableVehicles)],
    tours: ["Tours", firstNumeric(source.tours)],
    destinations: ["Destinations", firstNumeric(source.destinations)],
    bookings: ["Bookings", firstNumeric(source.bookings)],
    pendingBookings: ["Pending Bookings", firstNumeric(source.pendingBookings, summary.pendingBookings)],
    confirmedBookings: ["Confirmed Bookings", firstNumeric(source.confirmedBookings, summary.confirmedBookings)],
    payments: ["Payments", paymentCount],
    completedPayments: ["Completed Payments", firstNumeric(paymentStats.completed, source.completedPayments)],
    revenue: ["Revenue", money(firstNumeric(source.revenue), source.revenueCurrency || "KES")],
  };

  const primaryCards = [cards.revenue, cards.bookings, cards.payments, cards.customers];
  const operationalCards = [
    cards.users,
    cards.staff,
    cards.guides,
    cards.drivers,
    cards.agents,
    cards.approvedAgents,
    cards.vehicles,
    cards.availableVehicles,
    cards.tours,
    cards.destinations,
    cards.pendingBookings,
    cards.confirmedBookings,
    cards.completedPayments,
  ];

  return (
    <section className="space-y-5" aria-label="Business metrics">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Key performance indicators</h2>
            <p className="text-xs text-gray-500 sm:text-sm">Your most important business numbers at a glance.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {primaryCards.map(([title, value]) => (
            <StatCard
              key={title}
              title={title}
              value={value}
              className={title === "Revenue" ? "border-gray-300 xl:col-span-1" : ""}
              valueClassName={title === "Revenue" ? "text-2xl sm:text-3xl" : "text-2xl sm:text-3xl"}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Operational metrics</h2>
          <p className="text-xs text-gray-500 sm:text-sm">Staffing, fleet, inventory and booking workload.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {operationalCards.map(([title, value]) => (
            <StatCard key={title} title={title} value={value} />
          ))}
        </div>
      </div>
    </section>
  );
}
