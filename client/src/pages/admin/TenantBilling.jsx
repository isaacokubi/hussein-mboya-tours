import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Smartphone, Clock, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { getTenantSubscription, startTenantSubscriptionPayment } from "../../api/tenantSubscriptionApi";

const labels = { starter: "Starter", professional: "Professional", business: "Business", enterprise: "Enterprise" };
const money = (n) => `KES ${Number(n || 0).toLocaleString()}`;

export default function TenantBilling() {
  const qc = useQueryClient();
  const [phone, setPhone] = useState("");
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["tenant-subscription"], queryFn: getTenantSubscription, refetchInterval: 30000 });
  const pay = useMutation({ mutationFn: startTenantSubscriptionPayment, onSuccess: (r) => { toast.success(r.message || "Payment request sent."); qc.invalidateQueries({ queryKey: ["tenant-subscription"] }); }, onError: (e) => toast.error(e?.response?.data?.message || e.message || "Unable to start payment.") });
  if (isLoading) return <div className="rounded-2xl border bg-white p-8">Loading subscription...</div>;
  if (isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error?.response?.data?.message || "Unable to load subscription."}</div>;
  const tenant = data?.tenant || {}; const plan = data?.plan || tenant.subscription?.plan || "starter"; const amount = data?.amountDue || 0; const status = tenant.status || "trial"; const trialEnds = tenant.subscription?.trialEndsAt;
  const renews = tenant.subscription?.renewsAt || data?.subscription?.currentPeriodEndsAt;
  return <div className="space-y-6">
    <header><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Billing & Subscription</p><h1 className="mt-1 text-3xl font-bold text-slate-900">{tenant.name || "Company"} subscription</h1><p className="mt-2 text-slate-600">Your 14-day trial is free. Pay the platform subscription to activate or renew your workspace.</p></header>
    <div className="grid gap-5 md:grid-cols-3">
      <article className="rounded-2xl border bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Current plan</p><p className="mt-2 text-2xl font-bold">{labels[plan] || plan}</p><p className="mt-2 text-sm capitalize text-slate-500">Account: {status}</p></article>
      <article className="rounded-2xl border bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Trial / renewal</p><p className="mt-2 font-semibold">{status === "trial" && trialEnds ? `Trial ends ${new Date(trialEnds).toLocaleString()}` : renews ? `Renews ${new Date(renews).toLocaleString()}` : "Not scheduled"}</p><p className="mt-2 text-xs text-slate-500">A successful payment activates the account for 30 days.</p></article>
      <article className="rounded-2xl border bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Amount due</p><p className="mt-2 text-2xl font-bold">{amount ? money(amount) : "Not configured"}</p><p className="mt-2 text-xs text-slate-500">Plan prices are configured by the platform owner.</p></article>
    </div>
    <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Smartphone className="text-emerald-700"/><div><h2 className="text-xl font-bold">Pay with M-Pesa</h2><p className="text-sm text-slate-500">Enter the administrator's Kenyan M-Pesa number. An STK prompt will be sent to that phone.</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]"><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" className="rounded-xl border px-4 py-3"/><button disabled={!amount || pay.isPending} onClick={() => pay.mutate({ plan, phone })} className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white disabled:opacity-40">{pay.isPending ? "Sending STK..." : `Pay ${amount ? money(amount) : "subscription"}`}</button></div><p className="mt-3 text-xs text-slate-500">Payment is sent to the platform M-Pesa configuration on the server; tenant booking payments remain separate.</p></section>
    <section className="grid gap-4 md:grid-cols-3"><Info icon={<Clock/>} title="14-day trial">The trial starts when the company is created. If no payment is completed before the trial ends, the workspace becomes suspended.</Info><Info icon={<ShieldCheck/>} title="Automatic activation">A successful M-Pesa callback changes the subscription to active and starts a 30-day paid period.</Info><Info icon={<CreditCard/>} title="Expiry">When the paid period ends, the subscription becomes expired and the tenant is suspended until payment or SuperAdmin activation.</Info></section>
    <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Recent subscription payments</h2><div className="mt-4 space-y-2">{(data?.payments || []).length ? data.payments.map((p) => <div key={p._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"><span>{money(p.amount)} · {p.provider}</span><span className="capitalize font-semibold">{p.status}</span><span>{p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}</span></div>) : <p className="text-sm text-slate-500">No subscription payments yet.</p>}</div></section>
  </div>;
}
function Info({ icon, title, children }) { return <article className="rounded-2xl border bg-white p-5"><div className="flex items-center gap-2 font-bold">{icon}<span>{title}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{children}</p></article>; }
