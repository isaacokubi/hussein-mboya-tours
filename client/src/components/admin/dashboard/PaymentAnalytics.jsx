import { useSettings } from "../../../context/SettingsContext";

export default function PaymentAnalytics({ payments = {} }) {
  const { settings = {} } = useSettings() || {};
  const items = [
    ["Completed", payments.completed, payments.completedAmount],
    ["Pending", payments.pending, payments.pendingAmount],
    ["Failed", payments.failed, payments.failedAmount],
  ];
  const currency = String(settings.currencySymbol || settings.currency || "KSh").trim();
  const companyName = String(settings.companyName || "").trim();

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Payments</h2>
        <p className="mt-1 text-sm text-gray-500">
          {companyName ? `Current payment status for ${companyName}.` : "Current tenant payment status."}
        </p>
      </div>
      <div className="space-y-4">
        {items.map(([label, count, amount]) => (
          <div key={label} className="flex items-center justify-between border-b pb-3 last:border-0">
            <div>
              <span className="font-medium text-gray-700">{label}</span>
              {amount != null && <p className="text-xs text-gray-400">{currency} {Number(amount || 0).toLocaleString()}</p>}
            </div>
            <strong className="text-lg">{Number(count || 0).toLocaleString()}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
