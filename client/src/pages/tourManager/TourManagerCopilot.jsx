import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Bot, CalendarClock, CheckCircle2, RefreshCw, Wallet } from "lucide-react";
import { getOperationsCopilotSummary, sendBookingNotification } from "../../api/tourManagerApi";

const money = (value) => new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 2,
}).format(Number(value || 0));

function Metric({ label, value, hint, icon: Icon }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{hint}</p></div>
      <span className="rounded-xl bg-emerald-50 p-3 text-emerald-800"><Icon size={20}/></span>
    </div>
  </article>;
}

export default function TourManagerCopilot() {
  const reminderMutation = useMutation({
    mutationFn: ({ id, channel }) => sendBookingNotification(id, channel),
    onSuccess: () => window.alert("Payment reminder sent successfully."),
    onError: (error) => window.alert(error?.response?.data?.message || error?.message || "Payment reminder could not be sent."),
  });
  const query = useQuery({
    queryKey: ["tour-manager-copilot-summary"],
    queryFn: getOperationsCopilotSummary,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
  const result = query.data?.data;
  const summary = result?.summary || {};
  const trips = Array.isArray(result?.trips) ? result.trips : [];
  const followUps = Array.isArray(result?.paymentFollowUps) ? result.paymentFollowUps : [];

  return <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-800 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-100"><Bot size={15}/> Operations intelligence</div><h1 className="mt-4 text-3xl font-black sm:text-4xl">Safari Operations Copilot</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/80">A read-only view of tour profitability, missing assignments and booking balances. It never sends messages or changes payment records.</p></div>
        <button type="button" onClick={() => void query.refetch()} disabled={query.isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15 disabled:opacity-60"><RefreshCw size={16} className={query.isFetching ? "animate-spin" : ""}/>{query.isFetching ? "Refreshing…" : "Refresh insights"}</button>
      </header>

      {query.isPending && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">Loading tenant operations data…</div>}
      {query.isError && <div role="alert" className="rounded-2xl border border-rose-200 bg-white p-6"><div className="flex items-center gap-2 font-semibold text-rose-800"><AlertTriangle size={19}/> Operations summary unavailable</div><p className="mt-2 text-sm text-slate-600">{query.error?.response?.data?.message || query.error?.message || "Could not load the operations summary. No figures have been substituted."}</p><button type="button" onClick={() => void query.refetch()} className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white">Try again</button></div>}

      {result && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Booked value" value={money(summary.bookedValue)} hint="Active bookings linked to listed tours" icon={Wallet}/>
          <Metric label="Collected" value={money(summary.collectedValue)} hint="Amounts recorded as paid" icon={CheckCircle2}/>
          <Metric label="Outstanding" value={money(summary.outstandingValue)} hint="Booked less recorded collections" icon={CalendarClock}/>
          <Metric label="Estimated margin" value={money(summary.estimatedMargin)} hint="Booked value less estimated costs" icon={Bot}/>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Tours reviewed" value={summary.trips ?? 0} hint="Maximum 100 tours per refresh" icon={CalendarClock}/>
          <Metric label="Need attention" value={summary.tripsNeedingAttention ?? 0} hint="Assignment or record-completeness alerts" icon={AlertTriangle}/>
          <Metric label="Payment follow-ups" value={summary.bookingsWithOutstandingBalances ?? 0} hint={`${summary.urgentPaymentFollowUps ?? 0} with travel in three days or less`} icon={Wallet}/><Metric label="Asset alerts" value={summary.assetsNeedingAttention ?? 0} hint={`${summary.urgentAssetAlerts ?? 0} urgent expiry or maintenance alerts`} icon={AlertTriangle}/>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold text-slate-950">Tour readiness and profitability</h2><p className="mt-1 text-sm text-slate-500">Margins are estimates until costs are entered and reconciled.</p></div>
          <div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Tour</th><th className="px-5 py-3">Bookings / guests</th><th className="px-5 py-3">Booked</th><th className="px-5 py-3">Estimated cost</th><th className="px-5 py-3">Margin</th><th className="px-5 py-3">Alerts</th></tr></thead><tbody className="divide-y divide-slate-100">{trips.map((trip) => <tr key={trip.id} className="align-top"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{trip.title}</p><p className="mt-1 text-xs text-slate-500">{trip.startDate ? new Date(trip.startDate).toLocaleDateString("en-KE") : "Date not set"} · {trip.status}</p></td><td className="px-5 py-4">{trip.bookings} / {trip.guests}</td><td className="px-5 py-4 font-medium">{money(trip.bookedValue)}</td><td className="px-5 py-4">{money(trip.estimatedCost)}</td><td className={`px-5 py-4 font-semibold ${trip.estimatedMargin < 0 ? "text-rose-700" : "text-emerald-800"}`}>{money(trip.estimatedMargin)}</td><td className="px-5 py-4">{trip.alerts?.length ? <ul className="space-y-1 text-xs text-amber-800">{trip.alerts.map((alert) => <li key={alert}>• {alert}</li>)}</ul> : <span className="text-xs text-emerald-700">No recorded alerts</span>}</td></tr>)}{trips.length === 0 && <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-500">No tours are available for this tenant yet.</td></tr>}</tbody></table></div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold text-slate-950">Payment follow-up queue</h2><p className="mt-1 text-sm text-slate-500">Suggested follow-ups only. No SMS, email or WhatsApp message is sent from this page.</p></div>
          <div className="overflow-x-auto"><table className="min-w-[720px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Booking</th><th className="px-5 py-3">Guest</th><th className="px-5 py-3">Travel date</th><th className="px-5 py-3">Balance</th><th className="px-5 py-3">Priority</th></tr></thead><tbody className="divide-y divide-slate-100">{followUps.map((item) => <tr key={item.bookingId}><td className="px-5 py-4 font-semibold text-slate-900">{item.bookingNumber || item.bookingId.slice(-8)}</td><td className="px-5 py-4"><p>{item.customerName || "Guest name not recorded"}</p><p className="mt-1 text-xs text-slate-500">{item.customerPhone || item.customerEmail || "No contact details recorded"}</p></td><td className="px-5 py-4">{item.travelDate ? new Date(item.travelDate).toLocaleDateString("en-KE") : "Not set"}</td><td className="px-5 py-4 font-semibold">{money(item.balance)}</td><td className="px-5 py-4"><div className="flex flex-col items-start gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{item.priority}</span><div className="flex flex-wrap gap-2">{item.customerEmail && <button type="button" disabled={reminderMutation.isPending} onClick={() => reminderMutation.mutate({ id: item.bookingId, channel: "email" })} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Email reminder</button>}{item.customerPhone && <button type="button" disabled={reminderMutation.isPending} onClick={() => reminderMutation.mutate({ id: item.bookingId, channel: "sms" })} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">SMS reminder</button>}</div></div></td></tr>)}{followUps.length === 0 && <tr><td colSpan="5" className="px-5 py-8 text-center text-slate-500">No outstanding booking balances were found.</td></tr>}</tbody></table></div>
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold text-slate-950">Fleet, staff and document alerts</h2><p className="mt-1 text-sm text-slate-500">Alerts are generated from operational asset records and their documented metadata dates.</p></div>
          <div className="divide-y divide-slate-100">{(Array.isArray(result.assetAlerts) ? result.assetAlerts : []).map((asset) => <article key={asset.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-slate-900">{asset.name}</p><p className="mt-1 text-xs capitalize text-slate-500">{asset.type.replaceAll("_", " ")} · {asset.status}</p><div className="mt-3 flex flex-wrap gap-2">{asset.alerts.map((alert, index) => <span key={`${alert.kind}-${index}`} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${alert.severity === "urgent" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"}`}>{alert.message}{alert.dueAt ? ` · ${new Date(alert.dueAt).toLocaleDateString("en-KE")}` : ""}</span>)}</div></div></article>)}{(!result.assetAlerts || result.assetAlerts.length === 0) && <p className="p-6 text-sm text-slate-500">No expiry or maintenance alerts were found in the recorded operational assets.</p>}</div>
        </section>
        <p className="text-xs leading-5 text-slate-500">{result.disclaimer}</p>
      </>}
    </div>
  </section>;
}
