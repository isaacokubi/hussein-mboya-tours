import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Smartphone, Clock, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import {
  getTenantSubscription,
  startTenantSubscriptionPayment,
  getTenantSubscriptionPaymentStatus,
} from "../../api/tenantSubscriptionApi";

const labels = {
  starter: "Starter",
  professional: "Professional",
  business: "Business",
  enterprise: "Enterprise",
};

const money = (n) => `KES ${Number(n || 0).toLocaleString()}`;
const dateTime = (value) => (value ? new Date(value).toLocaleString("en-KE") : "Not scheduled");

const statusStyles = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  trial: "bg-blue-50 text-blue-700 ring-blue-200",
  trialing: "bg-blue-50 text-blue-700 ring-blue-200",
  suspended: "bg-red-50 text-red-700 ring-red-200",
  expired: "bg-red-50 text-red-700 ring-red-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function TenantBilling() {
  const qc = useQueryClient();
  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState("");

  const subscriptionQuery = useQuery({
    queryKey: ["tenant-subscription"],
    queryFn: getTenantSubscription,
    refetchInterval: 30000,
  });

  const paymentQuery = useQuery({
    queryKey: ["tenant-subscription-payment", checkoutRequestId],
    queryFn: () => getTenantSubscriptionPaymentStatus(checkoutRequestId),
    enabled: Boolean(checkoutRequestId),
    refetchInterval: (query) => {
      const status = query.state.data?.payment?.status;
      return status && ["completed", "failed", "cancelled"].includes(status) ? false : 5000;
    },
  });

  const pay = useMutation({
    mutationFn: startTenantSubscriptionPayment,
    onSuccess: (response) => {
      const id = response?.payment?.checkoutRequestID || response?.payment?.checkoutRequestId;
      if (id) setCheckoutRequestId(id);
      toast.success(response.message || "M-Pesa payment request sent.");
      qc.invalidateQueries({ queryKey: ["tenant-subscription"] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || error.message || "Unable to start payment."),
  });

  const data = subscriptionQuery.data;
  const tenant = data?.tenant || {};
  const currentPlan = String(data?.plan || tenant.subscription?.plan || "starter").toLowerCase();
  const plan = selectedPlan || currentPlan;
  const planPrices = data?.planPrices || {};
  const amount = Number(planPrices[plan] || (plan === currentPlan ? data?.amountDue : 0) || 0);
  const accountStatus = String(tenant.status || data?.subscription?.status || "trial").toLowerCase();
  const trialEnds = tenant.subscription?.trialEndsAt || data?.subscription?.trialEndsAt;
  const renews = tenant.subscription?.renewsAt || data?.subscription?.currentPeriodEndsAt;
  const pendingPayment = paymentQuery.data?.payment;

  useEffect(() => {
    if (currentPlan && !selectedPlan) setSelectedPlan(currentPlan);
  }, [currentPlan, selectedPlan]);

  useEffect(() => {
    if (pendingPayment?.status === "completed") {
      toast.success("Subscription payment confirmed. Your workspace is active.");
      qc.invalidateQueries({ queryKey: ["tenant-subscription"] });
      setCheckoutRequestId("");
    } else if (["failed", "cancelled"].includes(pendingPayment?.status)) {
      toast.error(pendingPayment.failureReason || "Subscription payment was not completed.");
      setCheckoutRequestId("");
    }
  }, [pendingPayment?.status]);

  const plans = useMemo(
    () => Object.keys(labels).map((key) => ({ key, name: labels[key], price: Number(planPrices[key] || 0) })),
    [planPrices]
  );

  if (subscriptionQuery.isLoading) return <div className="rounded-2xl border bg-white p-8">Loading subscription...</div>;
  if (subscriptionQuery.isError) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{subscriptionQuery.error?.response?.data?.message || "Unable to load subscription."}</div>;
  }

  const statusClass = statusStyles[accountStatus] || "bg-slate-50 text-slate-700 ring-slate-200";
  const canPay = amount > 0 && phone.trim().length > 0 && !pay.isPending && !checkoutRequestId;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Billing & Subscription</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">{tenant.name || "Company"} subscription</h1>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${statusClass}`}>{accountStatus}</span>
        </div>
        <p className="mt-2 text-slate-600">Manage your workspace plan, subscription period and M-Pesa payments from one place.</p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Current plan</p>
          <p className="mt-2 text-2xl font-bold">{labels[currentPlan] || currentPlan}</p>
          <p className="mt-2 text-sm text-slate-500">Selected for payment: <b>{labels[plan] || plan}</b></p>
        </article>
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Trial / renewal</p>
          <p className="mt-2 font-semibold">{accountStatus === "trial" || accountStatus === "trialing" ? dateTime(trialEnds) : dateTime(renews)}</p>
          <p className="mt-2 text-xs text-slate-500">Paid subscriptions run for the configured subscription period.</p>
        </article>
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Amount for selected plan</p>
          <p className="mt-2 text-2xl font-bold">{amount ? money(amount) : "Not configured"}</p>
          <p className="mt-2 text-xs text-slate-500">Prices are controlled by the platform owner.</p>
        </article>
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Choose a subscription plan</h2>
            <p className="mt-1 text-sm text-slate-500">Select the plan you want to activate or renew before starting M-Pesa payment.</p>
          </div>
          <button onClick={() => qc.invalidateQueries({ queryKey: ["tenant-subscription"] })} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map(({ key, name, price }) => {
            const selected = plan === key;
            return (
              <button key={key} type="button" onClick={() => setSelectedPlan(key)} className={`rounded-2xl border p-5 text-left transition ${selected ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-start justify-between gap-2"><span className="font-bold">{name}</span>{selected && <CheckCircle2 size={19} className="text-emerald-700" />}</div>
                <p className="mt-3 text-xl font-bold">{price ? money(price) : "Not configured"}</p>
                <p className="mt-1 text-xs text-slate-500">30-day platform subscription</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3"><Smartphone className="text-emerald-700" /><div><h2 className="text-xl font-bold">Pay with M-Pesa</h2><p className="text-sm text-slate-500">An STK prompt will be sent to the Kenyan M-Pesa number you enter.</p></div></div>
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="0712345678 or 254712345678" className="rounded-xl border px-4 py-3 outline-none focus:border-emerald-600" />
          <button disabled={!canPay} onClick={() => pay.mutate({ plan, phone })} className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
            {pay.isPending ? "Sending STK..." : checkoutRequestId ? "Waiting for payment..." : `Pay ${amount ? money(amount) : "subscription"}`}
          </button>
        </div>
        {checkoutRequestId && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex items-center gap-2 font-bold"><RefreshCw size={16} className="animate-spin" /> Waiting for M-Pesa confirmation</div>
            <p className="mt-1">Complete the STK prompt on your phone. The page checks the payment status automatically.</p>
          </div>
        )}
        {pendingPayment && !checkoutRequestId && (
          <div className={`mt-4 rounded-xl p-4 text-sm ${pendingPayment.status === "completed" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
            {pendingPayment.status === "completed" ? <CheckCircle2 className="inline mr-2" size={17} /> : <AlertCircle className="inline mr-2" size={17} />}
            Payment {pendingPayment.status}. {pendingPayment.mpesaReceiptNumber ? `Receipt: ${pendingPayment.mpesaReceiptNumber}.` : pendingPayment.failureReason || ""}
          </div>
        )}
        <p className="mt-3 text-xs text-slate-500">Subscription payments use the platform M-Pesa configuration. Customer booking payments remain separate.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Info icon={<Clock />} title="14-day trial">The trial starts when a company is created. After the trial, payment is required to keep the workspace active.</Info>
        <Info icon={<ShieldCheck />} title="Automatic activation">A verified M-Pesa callback marks the subscription active and starts the paid period.</Info>
        <Info icon={<CreditCard />} title="Payment history">Every subscription payment is recorded with its amount, provider, status, receipt and timestamp.</Info>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">Recent subscription payments</h2>
        <div className="mt-4 space-y-2">
          {(data?.payments || []).length ? data.payments.map((payment) => (
            <div key={payment._id} className="grid gap-2 rounded-xl border p-4 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
              <div><b>{money(payment.amount)}</b><span className="ml-2 text-slate-500">{payment.plan ? labels[payment.plan] || payment.plan : "Subscription"}</span><div className="text-xs text-slate-500">{payment.provider} · {payment.createdAt ? dateTime(payment.createdAt) : ""}</div></div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${payment.status === "completed" ? "bg-emerald-50 text-emerald-700" : payment.status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{payment.status}</span>
              <span className="text-xs text-slate-500">{payment.mpesaReceiptNumber || payment.transactionReference || "—"}</span>
            </div>
          )) : <p className="text-sm text-slate-500">No subscription payments yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Info({ icon, title, children }) {
  return <article className="rounded-2xl border bg-white p-5"><div className="flex items-center gap-2 font-bold">{icon}<span>{title}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{children}</p></article>;
}
