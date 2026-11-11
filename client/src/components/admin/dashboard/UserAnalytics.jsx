/**
 * Purpose: User Analytics reusable UI component. Main declarations: UserAnalytics, Card.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export default function UserAnalytics({ users = {} }) {
  // Declare total for use by the surrounding module or function.
  const total = Number(users.total ?? users.count ?? users.length ?? 0);
  // Declare active for use by the surrounding module or function.
  const active = Number(users.active ?? users.activeUsers ?? 0);
  // Declare newUsers for use by the surrounding module or function.
  const newUsers = Number(users.new ?? users.newUsers ?? 0);
  // Declare inactive for use by the surrounding module or function.
  const inactive = Number(users.inactive ?? 0);

  // Return the expression shown below to the caller.
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="User analytics">
      <Card title="Total Users" value={total} />
      <Card title="Active Users" value={active} />
      <Card title="New Users" value={newUsers} />
      <Card title="Inactive Users" value={inactive} />
    </section>
  );
}

// Define Card; its parameters and body implement this operation.
function Card({ title, value }) {
  // Return the expression shown below to the caller.
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="mt-2 text-3xl font-bold">{value || 0}</h3>
    </div>
  );
}
