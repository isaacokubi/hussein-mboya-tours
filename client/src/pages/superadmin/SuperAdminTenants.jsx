import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteSuperAdminTenant, getSuperAdminTenants, updateSuperAdminTenantStatus, switchSuperAdminTenantPlan } from "../../api/superAdminTenantsApi";
import { activateTenantSubscription } from "../../api/tenantSubscriptionApi";

const PLATFORM_HOST = String(import.meta.env.VITE_PLATFORM_HOST || "globaltours.com").replace(/^https?:\/\//, "").replace(/\/$/, "");
const PLANS = [
  { value: "starter", label: "Starter", tone: "slate" },
  { value: "professional", label: "Professional", tone: "emerald" },
  { value: "business", label: "Business", tone: "blue" },
  { value: "enterprise", label: "Enterprise", tone: "violet" },
];
const tenantUrl = (tenant) => `https://${tenant.slug}.${PLATFORM_HOST}`;
const planLabel = (plan) => PLANS.find((item) => item.value === String(plan || "").toLowerCase())?.label || String(plan || "—");
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function SuperAdminTenants() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [activateTarget, setActivateTarget] = useState(null);
  const [switchTarget, setSwitchTarget] = useState(null);
  const [switchPlan, setSwitchPlan] = useState("starter");
  const [activation, setActivation] = useState({ plan: "starter", periodDays: 30, amount: "", reference: "" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["platform-tenants", search],
    queryFn: () => getSuperAdminTenants({ search, limit: 100 }),
    staleTime: 30000,
    refetchOnMount: "always",
  });
  const tenants = data?.tenants || data?.data || [];

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["platform-tenants"] });
    qc.invalidateQueries({ queryKey: ["superadmin-dashboard"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateSuperAdminTenantStatus(id, status),
    onSuccess: (result) => { refresh(); toast.success(result.message || "Company status updated."); },
    onError: (err) => toast.error(err?.response?.data?.message || err.message || "Unable to update company."),
  });

  const switchMutation = useMutation({
    mutationFn: ({ id, plan }) => switchSuperAdminTenantPlan(id, plan),
    onSuccess: (result) => {
      setSwitchTarget(null);
      refresh();
      toast.success(result.message || "Subscription plan switched for testing.");
    },
    onError: (err) => toast.error(err?.response?.data?.message || err.message || "Unable to switch subscription plan."),
  });

  const activateMutation = useMutation({
    mutationFn: ({ id, payload }) => activateTenantSubscription(id, payload),
    onSuccess: (result) => { setActivateTarget(null); refresh(); toast.success(result.message || "Subscription activated."); },
    onError: (err) => toast.error(err?.response?.data?.message || err.message || "Unable to activate subscription."),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => deleteSuperAdminTenant(id, "DELETE"),
    onSuccess: (result) => { setDeleteTarget(null); setConfirmation(""); refresh(); toast.success(result.message || "Company deleted successfully."); },
    onError: (err) => toast.error(err?.response?.data?.message || err.message || "Unable to delete company."),
  });

  const openSwitcher = (tenant) => {
    setSwitchTarget(tenant);
    setSwitchPlan(String(tenant.subscription?.plan || "starter").toLowerCase());
  };

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Platform governance</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Companies / Tenants</h1>
          <p className="mt-1 max-w-3xl text-slate-600">Manage tenant lifecycle and quickly switch subscription plans for controlled platform testing without creating additional tenants.</p>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 md:w-80" />
      </header>

      {isLoading && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">Loading companies…</div>}
      {isError && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error?.response?.data?.message || error?.message || "Unable to load companies."}</div>}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[1580px] w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>{["Company", "Tenant URL", "Owner", "Status", "Plan", "Trial / Renewal", "Users", "Tours", "Bookings", "Created", "Management"].map((label) => <th key={label} className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((tenant) => {
                const c = tenant.counts || {};
                const protectedTenant = tenant.slug === "platform" || tenant.isSystem;
                const sub = tenant.subscription || {};
                const date = tenant.status === "trial" ? sub.trialEndsAt : sub.renewsAt;
                const currentPlan = String(sub.plan || "starter").toLowerCase();
                return (
                  <tr key={tenant._id} className="transition hover:bg-emerald-50/30">
                    <td className="px-5 py-4"><div className="font-bold text-slate-900">{tenant.name}</div><div className="text-xs text-slate-500">{tenant.slug}</div></td>
                    <td className="px-5 py-4"><a href={tenantUrl(tenant)} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-700 hover:underline">{tenantUrl(tenant)}</a></td>
                    <td className="px-5 py-4">{tenant.owner ? <><div className="font-medium text-slate-800">{tenant.owner.name}</div><div className="text-xs text-slate-500">{tenant.owner.email}</div></> : <span className="text-slate-400">No owner</span>}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${tenant.status === "active" ? "bg-emerald-100 text-emerald-800" : tenant.status === "trial" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>{tenant.status}</span></td>
                    <td className="px-5 py-4"><div className="font-bold capitalize text-slate-900">{planLabel(currentPlan)}</div><div className="text-xs text-slate-500">{sub.seats ? `${sub.seats} seats` : "Plan limits"}</div></td>
                    <td className="px-5 py-4 text-xs text-slate-600">{date === null ? "—" : formatDate(date)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-700">{c.users ?? 0}</td><td className="px-5 py-4 font-semibold text-slate-700">{c.tours ?? c.tourpackages ?? 0}</td><td className="px-5 py-4 font-semibold text-slate-700">{c.bookings ?? 0}</td><td className="px-5 py-4 text-sm text-slate-600">{formatDate(tenant.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => toast.info(`${tenant.name}: ${c.users ?? 0} users, ${c.tours ?? c.tourpackages ?? 0} tours, ${c.bookings ?? 0} bookings.`)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View</button>
                        {!protectedTenant && <button onClick={() => openSwitcher(tenant)} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-800">Switch Plan</button>}
                        <button disabled={protectedTenant || statusMutation.isPending} onClick={() => statusMutation.mutate({ id: tenant._id, status: tenant.status === "suspended" ? "active" : "suspended" })} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">{tenant.status === "suspended" ? "Activate" : "Suspend"}</button>
                        {!protectedTenant && <button onClick={() => { setActivateTarget(tenant); setActivation({ plan: currentPlan, periodDays: 30, amount: "", reference: "" }); }} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-100">Paid / Activate</button>}
                        <button disabled={protectedTenant} onClick={() => { setDeleteTarget(tenant); setConfirmation(""); }} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {tenants.length === 0 && <div className="p-10 text-center text-slate-500">No companies found.</div>}
        </div>
      )}

      {switchTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">Testing control</span><h2 className="mt-3 text-2xl font-bold text-slate-900">Switch subscription plan</h2><p className="mt-1 text-sm text-slate-500">{switchTarget.name}</p></div><button onClick={() => setSwitchTarget(null)} className="rounded-lg p-2 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">×</button></div>
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Test mode:</strong> this changes the tenant's plan and seat limit immediately without creating a tenant or requiring a payment reference. The existing renewal date is preserved.</div>
            <label className="mt-5 block text-sm font-bold text-slate-700">New subscription plan<select value={switchPlan} onChange={(e) => setSwitchPlan(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50">{PLANS.map((plan) => <option key={plan.value} value={plan.value}>{plan.label}</option>)}</select></label>
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><div className="flex justify-between"><span>Current plan</span><strong className="text-slate-900">{planLabel(switchTarget.subscription?.plan)}</strong></div><div className="mt-2 flex justify-between"><span>New plan</span><strong className="text-emerald-700">{planLabel(switchPlan)}</strong></div></div>
            <div className="mt-6 flex justify-end gap-3"><button onClick={() => setSwitchTarget(null)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button disabled={switchMutation.isPending || switchPlan === String(switchTarget.subscription?.plan || "starter").toLowerCase()} onClick={() => switchMutation.mutate({ id: switchTarget._id, plan: switchPlan })} className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40">{switchMutation.isPending ? "Switching…" : "Switch plan"}</button></div>
          </div>
        </div>
      )}

      {activateTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl"><h2 className="text-2xl font-bold">Activate {activateTarget.name} subscription</h2><p className="mt-2 text-sm text-slate-600">Use this for a verified bank/manual payment. M-Pesa payments activate automatically after a successful callback.</p><div className="mt-5 grid gap-3"><label className="text-sm font-semibold">Plan<select value={activation.plan} onChange={(e) => setActivation({ ...activation, plan: e.target.value })} className="mt-1 w-full rounded-xl border p-3">{PLANS.map((plan) => <option key={plan.value} value={plan.value}>{plan.label}</option>)}</select></label><label className="text-sm font-semibold">Paid days<input type="number" min="1" max="3660" value={activation.periodDays} onChange={(e) => setActivation({ ...activation, periodDays: e.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><label className="text-sm font-semibold">Amount<input type="number" min="1" value={activation.amount} onChange={(e) => setActivation({ ...activation, amount: e.target.value })} placeholder="Amount received" className="mt-1 w-full rounded-xl border p-3" /></label><label className="text-sm font-semibold">Payment reference<input value={activation.reference} onChange={(e) => setActivation({ ...activation, reference: e.target.value })} placeholder="M-Pesa receipt / bank reference" className="mt-1 w-full rounded-xl border p-3" /></label></div><div className="mt-5 flex justify-end gap-3"><button onClick={() => setActivateTarget(null)} className="rounded-lg border px-4 py-2">Cancel</button><button disabled={activateMutation.isPending || !activation.amount || !activation.reference} onClick={() => activateMutation.mutate({ id: activateTarget._id, payload: activation })} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-40">{activateMutation.isPending ? "Activating..." : "Confirm paid & activate"}</button></div></div></div>}
      {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl"><h2 className="text-2xl font-bold text-red-700">Delete {deleteTarget.name} permanently?</h2><p className="mt-3 text-slate-600">This permanently removes the company and tenant-scoped records. Other companies are not affected.</p><p className="mt-4 font-semibold">Type <code className="rounded bg-slate-100 px-2 py-1">DELETE</code> to confirm.</p><input autoFocus value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="mt-3 w-full rounded-xl border p-3" placeholder="DELETE" /><div className="mt-5 flex justify-end gap-3"><button onClick={() => setDeleteTarget(null)} className="rounded-lg border px-4 py-2">Cancel</button><button disabled={confirmation !== "DELETE" || deleteMutation.isPending} onClick={() => deleteMutation.mutate({ id: deleteTarget._id })} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-40">{deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}</button></div></div></div>}
    </main>
  );
}
