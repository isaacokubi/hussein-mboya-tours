import StatCard from "./Statcard";

const number = (value) => Number(value ?? 0).toLocaleString();
const money = (value) => `Ksh ${number(value)}`;

export default function StatsGrid({ stats = {}, summary = {} }) {
  const cards = [
    ["Users", number(stats.users)],
    ["Customers", number(stats.customers)],
    ["Tours", number(stats.tours)],
    ["Destinations", number(stats.destinations)],
    ["Bookings", number(stats.bookings)],
    ["Revenue", money(stats.revenue)],
    ["Pending Bookings", number(summary.pendingBookings)],
    ["Confirmed Bookings", number(summary.confirmedBookings)],
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([title, value]) => (
        <StatCard key={title} title={title} value={value} />
      ))}
    </div>
  );
}
