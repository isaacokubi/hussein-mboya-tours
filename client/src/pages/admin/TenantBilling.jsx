import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Smartphone, Clock, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { getTenantSubscription, getTenantSubscriptionPaymentStatus, startTenantSubscriptionPayment } from "../../api/tenantSubscriptionApi";

const labels = { starter: "Starter", professional: "Professional", business: "Business", enterprise: "Enterprise" };
const money = (n) => `KES ${Number(n || 0).toLocaleString()}`;
const normalizePhone = (value) => String(value || "").replace(/\s+/g, "").trim();

export default function TenantBilling() {
  const qc = useQueryClient();
  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [pendingCheckoutId, setPendingCheckoutId] = useState("");
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["tenant-subscription"], queryFn: getTenantSubscription, refetchInterval: 30000 });
  const planPrices = data?.planPrices || {};
  const availablePlans = useMemo(() => Object.keys(labels).filter((key) => Number(planPrices[key] || 0) > 0), [planPrices]);

  useEffect(() => {
    if (!selectedPlan) setSelectedPlan(data?.plan || data?.tenant?.subscription?.plan || availablePlans[0] || "starter");
  }, [data?.plan, data?.tenant?.subscription?.plan, availablePlans, selectedPlan]);

  const plan = selectedPlan || data?.plan || "starter";
  const amount = Number(planPrices[plan] || (plan === data?.plan ? data?.amountDue : 0));

  const pay = useMutation({
    mutationFn: startTenantSubscriptionPayment,
    onSuccess: (r) => {
      toast.success(r.message || "Payment request sent. Check the administrator's phone.");
      const checkoutRequestId = r?.payment?.checkoutRequestID || r?.data?.CheckoutRequestID || r?.data?.checkoutRequestID || "";
      setPendingCheckoutId(checkoutRequestId);
      qc.invalidateQueries({ queryKey: ["tenant-subscription"] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e.message || "Unable to start payment."),
  });

  const statusQuery = useQuery({
    queryKey: ["tenant-subscription-payment", pendingCheckoutId],
    queryFn: () => getTenantSubscriptionPaymentStatus(pendingCheckoutId),
    enabled: Boolean(pendingCheckoutId),
    refetchInterval: (query) => {
      const status = String(query.state.data?.payment?.status || "pending").toLowerCase();
      return ["completed", "paid", "failed", "cancelled", "refunded"].includes(status) ? false : 3000;
    },
  });

  useEffect(() => {
    const status = String(statusQuery.data?.payment?.status || "").toLowerCase();
    if (!status) return;
    if (["completed", "paid"].includes(status)) {
      toast.success("Subscription payment confirmed. Your workspace is now active.");
      setPendingCheckoutId("");
      qc.invalidateQueries({ queryKey: ["tenant-subscription"] });
    } else if (["failed", "cancelled", "refunded"].includes(status)) {
      toast.error(`Subscription payment ${status}. You can try again.`);
      setPendingCheckoutId("");
    }
  }, [statusQuery.data?.payment?.status, qc]);

  if (isLoading) return <div className="rounded-2xl border bg-white p-8">Loading billing and subscription...</div>;
  if (isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"><p className="font-semibold">{error?.response?.data?.message || "Unable to load billing and subscription."}</p><button type="button" onClick={() => refetch()} className="mt-3 rounded-lg border border-red-300 px-4 py-2">Retry</button></div>;

  const tenant = data?.tenant || {};
  const currentPlan = data?.plan || tenant.subscription?.plan || "starter";
  const status = tenant.status || "trial";
  const trialEnds = tenant.subscription?.trialEndsAt;
  const renews = tenant.subscription?.renewsAt || data?.subscription?.currentPeriodEndsAt;
  const pendingStatus = statusQuery.data?.payment?.status;

  return <div className="space-y-6">
    <header><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Billing & Subscription</p><h1 className="mt-1 text-3xl font-bold text-slate-900">{tenant.name || "Company"} subscription</h1><p className="mt-2 text-slate-600">Manage the company's platform plan, renewal and M-Pesa subscription payments.</p></header>
    <div className="grid gap-5 md:grid-cols-3">
      <article className="rounded-2xl border bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Current plan</p><p className="mt-2 text-2xl font-bold">{labels[currentPlan] || currentPlan}</p><p className="mt-2 text-sm capitalize text-slate-500">Account: {status}</p></article>
      <article className="rounded-2xl border bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Trial / renewal</p><p className="mt-2 font-semibold">{status === "trial" && trialEnds ? `Trial ends ${new Date(trialEnds).toLocaleString()}` : renews ? `Renews ${new Date(renews).toLocaleString()}` : "Not scheduled"}</p><p className="mt-2 text-xs text-slate-500">Successful subscription payment activates the selected plan for 30 days.</p></article>
      <article className="rounded-2xl border bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Selected plan price</p><p className="mt-2 text-2xl font-bold">{amount ? money(amount) : "Not configured"}</p><p className="mt-2 text-xs text-slate-500">Plan prices are controlled by the platform owner.</p></article>
    </div>

    <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Smartphone className="text-emerald-700"/><div><h2 className="text-xl font-bold">Pay with M-Pesa</h2><p className="text-sm text-slate-500">Select a configured plan, enter the administrator's Kenyan M-Pesa number and confirm the STK prompt.</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-3">
      <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">Subscription plan</span><select value={plan} onChange={(e) => setSelectedPlan(e.target.value)} className="w-full rounded-xl border px-4 py-3"><option value="" disabled>Select a plan</option>{Object.keys(labels).map((key) => <option key={key} value={key} disabled={!Number(planPrices[key] || 0)}>{labels[key]}{Number(planPrices[key] || 0) ? ` — ${money(planPrices[key])}` : " — Not configured"}</option>)}</select></label>
      <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">Administrator M-Pesa number</span><input value={phone} onChange={(e) => setPhone(normalizePhone(e.target.value))} placeholder="0712345678" inputMode="tel" className="w-full rounded-xl border px-4 py-3" /></label>
      <div className="flex items-end"><button type="button" disabled={!amount || !phone || pay.isPending || Boolean(pendingCheckoutId)} onClick={() => pay.mutate({ plan, phone })} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40">{pay.isPending ? "Sending STK..." : pendingCheckoutId ? "Waiting for payment..." : `Pay ${amount ? money(amount) : "subscription"}`}</button></div>
    </div>
    {pendingCheckoutId && <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><RefreshCw size={18} className="animate-spin"/><span>Waiting for M-Pesa confirmation{pendingStatus ? ` — status: ${pendingStatus}` : "..."}. Complete the PIN prompt on the phone.</span></div>}
    {!availablePlans.length && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">No subscription plan prices are configured yet. A SuperAdmin must configure the plan prices before tenants can pay.</div>}
    <p className="mt-3 text-xs text-slate-500">Subscription payments use the platform M-Pesa configuration on the server; tenant tour-booking payments remain separate.</p></section>

    <section className="grid gap-4 md:grid-cols-3"><Info icon={<Clock/>} title="14-day trial">The trial starts when the company is created. If no payment is completed before the trial ends, the workspace becomes suspended.</Info><Info icon={<ShieldCheck/>} title="Automatic activation">A successful M-Pesa callback changes the subscription to active and starts a 30-day paid period.</Info><Info icon={<CreditCard/>} title="Expiry">When the paid period ends, the subscription becomes expired and the tenant is suspended until payment or SuperAdmin activation.</Info></section>
    <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Recent subscription payments</h2><div className="mt-4 space-y-2">{(data?.payments || []).length ? data.payments.map((p) => <div key={p._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"><span>{money(p.amount)} · {p.provider}</span><span className="capitalize font-semibold">{p.status}</span><span>{p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}</span></div>) : <p className="text-sm text-slate-500">No subscription payments yet.</p>}</div></section>
  </div>;
}
function Info({ icon, title, children }) { return <article className="rounded-2xl border bg-white p-5"><div className="flex items-center gap-2 font-bold">{icon}<span>{title}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{children}</p></article>; }
