/**
 * Purpose: Payment Analytics reusable UI component. Main declarations: PaymentAnalytics.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useSettings } from "../../../context/SettingsContext";

// Define PaymentAnalytics; its parameters and body implement this operation.
export default function PaymentAnalytics({ payments = {} }) {
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare items for use by the surrounding module or function.
  const items = [
    ["Completed", payments.completed, payments.completedAmount, "border-emerald-200 bg-emerald-50 text-emerald-800"],
    ["Pending / Processing", payments.pending, payments.pendingAmount, "border-amber-200 bg-amber-50 text-amber-800"],
    ["Failed", payments.failed, payments.failedAmount, "border-red-200 bg-red-50 text-red-800"],
  ];
  // Declare currency for use by the surrounding module or function.
  const currency = String(settings.currencySymbol || settings.currency || "KSh").trim();
  // Declare companyName for use by the surrounding module or function.
  const companyName = String(settings.companyName || "").trim();

  // Return the expression shown below to the caller.
  return (
    <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-6">
      <div className="mb-5"><h2 className="text-xl font-bold text-slate-900">Payments</h2><p className="mt-1 text-sm text-slate-600">{companyName ? `Current payment status for ${companyName}.` : "Current tenant payment status."}</p></div>
      <div className="space-y-3">
        {items.map(([label, count, amount, badge]) => (
          <div key={label} className={`flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm ${badge}`}>
            <div className="min-w-0"><span className="inline-flex rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold ring-1 ring-black/5">{label}</span>{amount != null && <p className="mt-2 text-sm font-semibold opacity-80">{currency} {Number(amount || 0).toLocaleString()}</p>}</div>
            <strong className="shrink-0 text-3xl font-extrabold">{Number(count || 0).toLocaleString()}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
