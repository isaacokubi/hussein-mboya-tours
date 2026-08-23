export default function PaymentAnalytics({ payments = {} }) {
  const items = [
    ["Completed", payments.completed, payments.completedAmount],
    ["Pending", payments.pending, payments.pendingAmount],
    ["Failed", payments.failed, payments.failedAmount],
  ];

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Payments</h2>
        <p className="mt-1 text-sm text-gray-500">Current payment status for this platform.</p>
      </div>
      <div className="space-y-4">
        {items.map(([label, count, amount]) => (
          <div key={label} className="flex items-center justify-between border-b pb-3 last:border-0">
            <div>
              <span className="font-medium text-gray-700">{label}</span>
              {amount != null && <p className="text-xs text-gray-400">Ksh {Number(amount || 0).toLocaleString()}</p>}
            </div>
            <strong className="text-lg">{Number(count || 0).toLocaleString()}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
