export default function UserAnalytics({ users = {} }) {
  const total = Array.isArray(users) ? users.length : Number(users?.total ?? users?.count ?? 0);
  const active = Array.isArray(users)
    ? users.filter((user) => user?.isActive !== false && user?.active !== false).length
    : Number(users?.active ?? users?.activeUsers ?? 0);
  const inactive = Array.isArray(users)
    ? Math.max(total - active, 0)
    : Number(users?.inactive ?? users?.inactiveUsers ?? 0);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card title="Total Users" value={total} />
      <Card title="Active Users" value={active} />
      <Card title="Inactive Users" value={inactive} />
    </section>
  );
}

function Card({ title, value }) {
  return (
    <div className="border rounded-lg p-5 bg-white">
      <p className="text-gray-500">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value || 0}</h3>
    </div>
  );
}
