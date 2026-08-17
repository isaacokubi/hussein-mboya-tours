import StatCard from "./Statcard";

export default function StatsGrid({ stats = {}, summary = {} }) {
  const cards = [
    ["Users", stats.users ?? 0],
    ["Tours", stats.tours ?? 0],
    ["Bookings", stats.bookings ?? 0],
    ["Revenue", `Ksh ${Number(stats.revenue || 0).toLocaleString()}`],
    ["Pending", summary.pendingBookings ?? 0],
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {cards.map(([title, value]) => (
        <StatCard key={title} title={title} value={value} />
      ))}
    </div>
  );
}
