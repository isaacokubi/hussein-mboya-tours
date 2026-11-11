/**
 * Purpose: Stats Grid reusable UI component. Main declarations: number, money, StatsGrid.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import StatCard from "./Statcard";
// Load ../../../utils/dashboardData so this module can use its exported dependencies.
import { firstNumeric, numeric, unwrapData } from "../../../utils/dashboardData";

// Declare number for use by the surrounding module or function.
const number = (value) => numeric(value).toLocaleString();
// Declare money for use by the surrounding module or function.
const money = (value, currency = "KES") => `${currency} ${number(value)}`;

// Define StatsGrid; its parameters and body implement this operation.
export default function StatsGrid({ stats = {}, summary = {} }) {
  // Declare source for use by the surrounding module or function.
  const source = unwrapData(stats);
  // Declare paymentStats for use by the surrounding module or function.
  const paymentStats = source.paymentStats || {};
  // The canonical payment count comes from the payments collection. Do not derive
  // it from the visible status buckets because processing/legacy states may not be
  // represented by the three dashboard buckets.
  // Declare paymentCount for use by the surrounding module or function.
  const paymentCount = firstNumeric(source.payments, paymentStats.completed, paymentStats.pending, paymentStats.failed);

  // Declare cards for use by the surrounding module or function.
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

  // Declare primaryCards for use by the surrounding module or function.
  const primaryCards = [cards.revenue, cards.bookings, cards.payments, cards.customers];
  // Declare operationalCards for use by the surrounding module or function.
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

  // Return the expression shown below to the caller.
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
          <p className="text-xs text-gray-500 sm:text-sm">Users are all active tenant user accounts; Customers are the customer accounts within those users.</p>
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
