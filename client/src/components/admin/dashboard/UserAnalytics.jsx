export default function UserAnalytics({ users = {} }) {
  const total = Number(users.total ?? users.count ?? users.length ?? 0);
  const active = Number(users.active ?? users.activeUsers ?? 0);
  const newUsers = Number(users.new ?? users.newUsers ?? 0);
  const inactive = Number(users.inactive ?? 0);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="User analytics">
      <Card title="Total Users" value={total} />
      <Card title="Active Users" value={active} />
      <Card title="New Users" value={newUsers} />
      <Card title="Inactive Users" value={inactive} />
    </section>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="mt-2 text-3xl font-bold">{value || 0}</h3>
    </div>
  );
}
