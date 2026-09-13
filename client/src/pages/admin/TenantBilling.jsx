import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  History,
  Info,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  WalletCards,
  XCircle,
} from "lucide-react";
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

const planDescriptions = {
  starter: "Essential tools for a growing travel business.",
  professional: "Advanced operations, finance and customer management.",
  business: "Higher capacity for established tour operators.",
  enterprise: "Enterprise-scale workspace and commercial operations.",
};

const money = (n) => `KES ${Number(n || 0).toLocaleString("en-KE")}`;
const dateTime = (value) => (value ? new Date(value).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" }) : "Not scheduled");
const dateOnly = (value) => (value ? new Date(value).toLocaleDateString("en-KE", { dateStyle: "medium" }) : "—");

const statusStyles = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  trial: "bg-blue-50 text-blue-700 ring-blue-200",
  trialing: "bg-blue-50 text-blue-700 ring-blue-200",
  suspended: "bg-red-50 text-red-700 ring-red-200",
  expired: "bg-red-50 text-red-700 ring-red-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
};

const paymentStatusStyles = {
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
  cancelled: "bg-slate-100 text-slate-700 ring-slate-200",
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
      toast.success(response?.message || "M-Pesa payment request sent.");
      qc.invalidateQueries({ queryKey: ["tenant-subscription"] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || error.message || "Unable to start payment."),
  });

  const data = subscriptionQuery.data;
  const tenant = data?.tenant || {};
  const currentPlan = String(data?.plan || tenant.subscription?.plan || "starter").toLowerCase();
  const plan = selectedPlan || currentPlan;
  const planPrices = data?.planPrices && typeof data.planPrices === "object" ? data.planPrices : {};
  const amount = Number(planPrices[plan] || (plan === currentPlan ? data?.amountDue : 0) || 0);
  const accountStatus = String(tenant.status || data?.subscription?.status || "trial").toLowerCase();
  const trialEnds = tenant.subscription?.trialEndsAt || data?.subscription?.trialEndsAt;
  const renews = tenant.subscription?.renewsAt || data?.subscription?.currentPeriodEndsAt;
  const pendingPayment = paymentQuery.data?.payment;
  const payments = Array.isArray(data?.payments) ? data.payments : [];

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

  const selectedPlanPriceConfigured = amount > 0;
  const normalizedPhone = phone.trim().replace(/\s+/g, "").replace(/^\+/, "");
  const phoneLooksKenyan = /^(?:0[17]\d{8}|254[17]\d{8})$/.test(normalizedPhone);
  const canPay = selectedPlanPriceConfigured && phoneLooksKenyan && !pay.isPending && !checkoutRequestId;
  const latestPayment = payments[0];
  const statusClass = statusStyles[accountStatus] || "bg-slate-50 text-slate-700 ring-slate-200";
  const isTrial = accountStatus === "trial" || accountStatus === "trialing";

  if (subscriptionQuery.isLoading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><div className="flex items-center gap-3 text-slate-600"><RefreshCw size={18} className="animate-spin" /> Loading subscription and billing information...</div></div>;
  }

  if (subscriptionQuery.isError) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 shrink-0" /><div><p className="font-bold">Unable to load billing</p><p className="mt-1 text-sm">{subscriptionQuery.error?.response?.data?.message || subscriptionQuery.error?.message || "The subscription service could not be reached."}</p><button onClick={() => subscriptionQuery.refetch()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white"><RefreshCw size={15} /> Try again</button></div></div></div>;
  }

  return (
    <div className="admin-control-center space-y-6">
      <header className="admin-dashboard-header rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Billing & Subscription</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{tenant.name || "Company"} subscription</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold capitalize ring-1 ${statusClass}`}>
                {accountStatus === "active" ? <CheckCircle2 size={14} /> : accountStatus === "suspended" || accountStatus === "expired" ? <XCircle size={14} /> : <Clock3 size={14} />}
                {accountStatus}
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Manage the workspace subscription, review billing activity and securely pay the platform subscription through Kenyan M-Pesa.</p>
          </div>
          <button onClick={() => subscriptionQuery.refetch()} disabled={subscriptionQuery.isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50">
            <RefreshCw size={16} className={subscriptionQuery.isFetching ? "animate-spin" : ""} /> Refresh billing
          </button>
        </div>
      </header>

      {(accountStatus === "suspended" || accountStatus === "expired") && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
          <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 shrink-0" /><div><h2 className="font-extrabold">Workspace payment required</h2><p className="mt-1 text-sm leading-6">Your workspace is currently {accountStatus}. Select a configured plan below and complete payment to restore or continue service. Activation occurs only after the payment callback is verified.</p></div></div>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Summary icon={<WalletCards />} label="Current plan" value={labels[currentPlan] || currentPlan} detail={isTrial ? "Currently in trial" : "Paid subscription"} />
        <Summary icon={<Clock3 />} label={isTrial ? "Trial ends" : "Renews"} value={isTrial ? dateOnly(trialEnds) : dateOnly(renews)} detail={isTrial ? "14-day onboarding period" : "Next subscription period"} />
        <Summary icon={<CreditCard />} label="Selected plan" value={labels[plan] || plan} detail={selectedPlanPriceConfigured ? money(amount) : "Price not configured"} />
        <Summary icon={<History />} label="Latest payment" value={latestPayment ? money(latestPayment.amount) : "No payments"} detail={latestPayment ? `${latestPayment.status} · ${dateOnly(latestPayment.createdAt)}` : "Payment history will appear here"} />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Workspace plan</p><h2 className="mt-1 text-2xl font-black text-slate-950">Choose a subscription plan</h2><p className="mt-1 max-w-2xl text-sm text-slate-500">Plan prices are controlled by the platform owner. A plan is available for payment only when its price is configured.</p></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200"><LockKeyhole size={14} /> Platform-controlled pricing</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map(({ key, name, price }) => {
            const selected = plan === key;
            const current = currentPlan === key;
            const configured = price > 0;
            return (
              <button key={key} type="button" onClick={() => configured && setSelectedPlan(key)} disabled={!configured} className={`group rounded-2xl border p-5 text-left transition ${selected ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-100" : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"} ${!configured ? "cursor-not-allowed opacity-65" : ""}`}>
                <div className="flex items-start justify-between gap-3"><div><span className="font-extrabold text-slate-950">{name}</span>{current && <span className="ml-2 rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">Current</span>}</div>{selected && configured && <CheckCircle2 size={19} className="shrink-0 text-emerald-700" />}</div>
                <p className="mt-4 text-2xl font-black text-slate-950">{configured ? money(price) : "Not configured"}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">30-day platform subscription</p>
                <p className="mt-4 text-sm leading-5 text-slate-600">{planDescriptions[key]}</p>
                <div className={`mt-5 inline-flex items-center gap-1 text-xs font-bold ${configured ? "text-emerald-700" : "text-slate-500"}`}>{configured ? "Available for payment" : "Contact platform owner"}<ChevronRight size={14} /></div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3"><div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Smartphone size={22} /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Kenya payments</p><h2 className="mt-1 text-2xl font-black text-slate-950">Pay with M-Pesa</h2><p className="mt-1 text-sm text-slate-500">An STK Push is sent to the Kenyan M-Pesa number you enter. Never share your M-Pesa PIN with anyone.</p></div></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200"><ShieldCheck size={14} /> Secure checkout</span>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected plan</p><p className="mt-1 text-lg font-extrabold text-slate-950">{labels[plan] || plan}</p></div><p className="text-xl font-black text-emerald-700">{selectedPlanPriceConfigured ? money(amount) : "Not configured"}</p></div>
            <div className="mt-5"><label htmlFor="subscription-mpesa-phone" className="text-sm font-bold text-slate-800">M-Pesa phone number</label><div className="mt-2 flex flex-col gap-3 sm:flex-row"><input id="subscription-mpesa-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="0712345678 or 254712345678" aria-describedby="subscription-phone-help" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><button disabled={!canPay} onClick={() => pay.mutate({ plan, phone })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-extrabold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40">{pay.isPending ? <><RefreshCw size={16} className="animate-spin" /> Sending STK...</> : checkoutRequestId ? <><RefreshCw size={16} className="animate-spin" /> Waiting...</> : <>Pay {selectedPlanPriceConfigured ? money(amount) : "subscription"}</>}</button></div><p id="subscription-phone-help" className={`mt-2 text-xs ${phone && !phoneLooksKenyan ? "text-red-600" : "text-slate-500"}`}>{phone && !phoneLooksKenyan ? "Enter a valid Kenyan Safaricom/M-Pesa number, for example 0712345678 or 254712345678." : "Accepted format: 07XXXXXXXX or 2547XXXXXXXX / 2541XXXXXXXX."}</p></div>
            {!selectedPlanPriceConfigured && <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><Info size={17} className="mt-0.5 shrink-0" /><p>The selected plan has no configured price. A platform owner must configure subscription pricing before M-Pesa checkout can begin.</p></div>}
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5"><h3 className="font-extrabold text-slate-950">How subscription payment works</h3><ol className="mt-4 space-y-3 text-sm text-slate-700"><li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-emerald-700 ring-1 ring-emerald-200">1</span><span>Select a plan with a configured price.</span></li><li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-emerald-700 ring-1 ring-emerald-200">2</span><span>Enter the Kenyan M-Pesa number that will receive the STK prompt.</span></li><li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-emerald-700 ring-1 ring-emerald-200">3</span><span>Approve the prompt using your M-Pesa PIN on your phone.</span></li><li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-emerald-700 ring-1 ring-emerald-200">4</span><span>The verified callback activates the subscription and records the payment.</span></li></ol></div>
        </div>

        {checkoutRequestId && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><RefreshCw size={18} className="mt-0.5 shrink-0 animate-spin" /><div><p className="font-extrabold">Waiting for M-Pesa confirmation</p><p className="mt-1 leading-6">Complete the STK prompt on your phone. Payment status is checked automatically. Keep this page open until confirmation.</p></div></div>}
        {pendingPayment && !checkoutRequestId && <div className={`mt-5 flex items-start gap-3 rounded-2xl border p-5 text-sm ${pendingPayment.status === "completed" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>{pendingPayment.status === "completed" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}<div><p className="font-extrabold">Payment {pendingPayment.status}</p><p className="mt-1 leading-6">{pendingPayment.mpesaReceiptNumber ? `M-Pesa receipt: ${pendingPayment.mpesaReceiptNumber}.` : pendingPayment.failureReason || "The payment status has been updated."}</p></div></div>}
        <p className="mt-5 text-xs leading-5 text-slate-500">Subscription payments use the platform M-Pesa configuration. Customer booking payments remain separate. M-Pesa credentials and callback secrets are never exposed in this page.</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between md:p-7"><div><div className="flex items-center gap-2"><History size={19} className="text-emerald-700" /><h2 className="text-xl font-black text-slate-950">Subscription payment history</h2></div><p className="mt-1 text-sm text-slate-500">Verified subscription transactions recorded for this company.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200"><FileText size={14} /> {payments.length} recent record{payments.length === 1 ? "" : "s"}</span></div>
        {payments.length ? <div className="divide-y divide-slate-100">{payments.map((payment) => { const paymentStatus = String(payment.status || "pending").toLowerCase(); const style = paymentStatusStyles[paymentStatus] || paymentStatusStyles.pending; return <div key={payment._id || payment.checkoutRequestID || payment.createdAt} className="grid gap-4 p-5 md:grid-cols-[1fr_auto_auto] md:items-center md:p-6"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-extrabold text-slate-950">{money(payment.amount)}</p><span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold capitalize ring-1 ${style}`}>{paymentStatus}</span></div><p className="mt-1 text-sm text-slate-600">{payment.plan ? labels[payment.plan] || payment.plan : "Subscription"} · {payment.provider || "—"}</p><p className="mt-1 text-xs text-slate-500">{dateTime(payment.createdAt)}</p></div><div className="text-sm md:text-right"><p className="font-semibold text-slate-700">{payment.mpesaReceiptNumber || payment.transactionReference || "No receipt/reference"}</p><p className="mt-1 text-xs text-slate-500">{payment.mpesaReceiptNumber ? "M-Pesa receipt" : "Transaction reference"}</p></div><div className="text-xs text-slate-500 md:text-right"><p>{payment.paidAt ? `Paid ${dateTime(payment.paidAt)}` : "Not paid"}</p><p className="mt-1">{Number(payment.periodDays || 30)} days</p></div></div>; })}</div> : <div className="p-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400"><FileText size={22} /></div><h3 className="mt-4 font-bold text-slate-900">No subscription payments yet</h3><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Completed subscription transactions will appear here with their amount, provider, status, receipt and timestamp.</p></div>}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Info icon={<Clock3 />} title="Trial period">The trial starts when a company is created. Payment is required after the configured trial period to keep the workspace active.</Info>
        <Info icon={<ShieldCheck />} title="Verified activation">A successful, verified M-Pesa callback marks the subscription active and starts the paid period.</Info>
        <Info icon={<CreditCard />} title="Payment records">Subscription payments are stored separately from customer booking payments for clean platform billing reconciliation.</Info>
      </section>
    </div>
  );
}

function Summary({ icon, label, value, detail }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">{icon}</div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p></div><p className="mt-4 text-xl font-black text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></article>;
}

function Info({ icon, title, children }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 font-extrabold text-slate-950">{icon}<span>{title}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{children}</p></article>;
}
