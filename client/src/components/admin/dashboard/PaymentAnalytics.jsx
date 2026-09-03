import { useSettings } from "../../../context/SettingsContext";

export default function PaymentAnalytics({ payments = {} }) {
  const { settings = {} } = useSettings() || {};
  const items = [
    ["Completed", payments.completed, payments.completedAmount, "bg-emerald-50 text-emerald-700 ring-emerald-200"],
    ["Pending", payments.pending, payments.pendingAmount, "bg-amber-50 text-amber-700 ring-amber-200"],
    ["Failed", payments.failed, payments.failedAmount, "bg-red-50 text-red-700 ring-red-200"],
  ];
  const currency = String(settings.currencySymbol || settings.currency || "KSh").trim();
  const companyName = String(settings.companyName || "").trim();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Payments</h2>
        <p className="mt-1 text-sm text-slate-500">
          {companyName ? `Current payment status for ${companyName}.` : "Current tenant payment status."}
        </p>
      </div>
      <div className="space-y-3">
        {items.map(([label, count, amount, badge]) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
            <div className="min-w-0">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badge}`}>{label}</span>
              {amount != null && (
                <p className="mt-2 text-sm text-slate-500">{currency} {Number(amount || 0).toLocaleString()}</p>
              )}
            </div>
            <strong className="shrink-0 text-2xl font-bold text-slate-900">{Number(count || 0).toLocaleString()}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
