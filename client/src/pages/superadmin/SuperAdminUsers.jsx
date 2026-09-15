import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Activity,
  Ban,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  UserCog,
  XCircle,
} from "lucide-react";
import api from "../../api/axios";
import { getSuperAdminDashboardMetrics } from "../../api/superAdminApi";
import { createSuperAdminTenant, getSuperAdminTenantPlans } from "../../api/superAdminTenantsApi";
import Pagination from "../../components/admin/Pagination";

const PAGE_SIZE = 10;
const STATUS_VALUES = ["active", "inactive", "disabled", "suspended", "blocked"];
const PLATFORM_HOST = String(import.meta.env.VITE_PLATFORM_HOST || "globaltours.com")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");
const INITIAL_FORM = {
  companyName: "",
  legalName: "",
  slug: "",
  companyEmail: "",
  companyPhone: "",
  domain: "",
  country: "Kenya",
  timezone: "Africa/Nairobi",
  currency: "KES",
  plan: "starter",
  seats: 5,
  websiteUrl: "",
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  adminPassword: "",
};

const getUsers = async (search, page) =>
  (await api.get("/superadmin/users", { params: { search, page, limit: PAGE_SIZE } })).data;
const updateStatus = async (id, status) =>
  (await api.put(`/superadmin/users/${id}/status`, { status })).data;
const removeUser = async (id) => (await api.delete(`/superadmin/users/${id}`)).data;

const roleLabel = (role) =>
  String(role || "customer")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const statusLabel = (status) =>
  String(status || "active")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function CompanyTenantForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const {
    data: planData,
    isLoading: plansLoading,
    isError: plansError,
  } = useQuery({
    queryKey: ["superadmin-tenant-plans"],
    queryFn: getSuperAdminTenantPlans,
    staleTime: 600000,
    retry: 1,
  });
  const plans = planData?.plans || [];
  const selectedPlan = plans.find((plan) => plan.value === form.plan);
  const tenantSlug = String(form.slug || form.companyName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const platformUrl = tenantSlug
    ? `https://${tenantSlug}.${PLATFORM_HOST}`
    : `https://<company-slug>.${PLATFORM_HOST}`;

  const handleChange = ({ target: { name, value } }) => {
    if (name === "plan") {
      const nextPlan = plans.find((plan) => plan.value === value);
      setForm((current) => ({
        ...current,
        plan: value,
        seats: nextPlan?.seats || current.seats,
      }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await createSuperAdminTenant({ ...form, seats: Number(form.seats) });
      toast.success(result.message || "Company created successfully.");
      await onCreated?.();
      setForm(INITIAL_FORM);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Unable to create company.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_-28px_rgba(15,23,42,0.35)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-6 py-6 text-white md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
              <Building2 className="h-3.5 w-3.5" /> Tenant onboarding
            </div>
            <h2 className="text-xl font-bold md:text-2xl">Create Company / Tenant</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Create an isolated company workspace and its initial administrator with the correct commercial defaults.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <XCircle className="mr-1.5 inline h-4 w-4" /> Close
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {error && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <Ban className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Company creation failed</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-8">
          <section>
            <SectionTitle title="Company information" subtitle="Identity, contact and tenant routing details." />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} required />
              <Field label="Legal Name" name="legalName" value={form.legalName} onChange={handleChange} />
              <Field label="Company Email" type="email" name="companyEmail" value={form.companyEmail} onChange={handleChange} required />
              <Field label="Company Phone" name="companyPhone" value={form.companyPhone} onChange={handleChange} required maxLength={10} inputMode="numeric" />
              <Field label="Company Slug" name="slug" value={form.slug} onChange={handleChange} />
              <Field label="Website" name="websiteUrl" value={form.websiteUrl} onChange={handleChange} />
              <Field label="Country" name="country" value={form.country} onChange={handleChange} required />
              <Field label="Currency" name="currency" value={form.currency} onChange={handleChange} required maxLength={3} />
              <Field label="Timezone" name="timezone" value={form.timezone} onChange={handleChange} required />
              <Field label="Custom Domain (optional)" name="domain" value={form.domain} onChange={handleChange} />
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Subscription Plan</span>
                <select
                  name="plan"
                  value={form.plan}
                  onChange={handleChange}
                  disabled={plansLoading || plans.length === 0}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-100"
                >
                  <option value="starter">Starter</option>
                  {plans.map((plan) => (
                    <option key={plan.value} value={plan.value}>{plan.label}</option>
                  ))}
                </select>
                {plansError && <span className="text-xs text-amber-700">Unable to load current plan configuration.</span>}
              </label>
              <Field label="User Seats" type="number" name="seats" value={form.seats} onChange={handleChange} required min={selectedPlan?.seats || 1} max={10000} />
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
            <div className="flex items-center gap-2 text-emerald-950">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-bold">Tenant URL</h3>
            </div>
            <p className="mt-1 text-sm text-emerald-900/70">This is the expected platform address for the new company workspace.</p>
            <div className="mt-3 overflow-x-auto rounded-xl border border-emerald-200 bg-white px-4 py-3 font-mono text-sm text-slate-800">{platformUrl}</div>
          </section>

          <section>
            <SectionTitle title="Primary administrator" subtitle="The first tenant administrator created for this workspace." />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Full Name" name="adminName" value={form.adminName} onChange={handleChange} required />
              <Field label="Email" type="email" name="adminEmail" value={form.adminEmail} onChange={handleChange} required />
              <Field label="Phone Number" name="adminPhone" value={form.adminPhone} onChange={handleChange} required maxLength={10} inputMode="numeric" />
              <Field label="Temporary Password" type="password" name="adminPassword" value={form.adminPassword} onChange={handleChange} required minLength={12} />
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCancel} disabled={saving} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving || plansLoading || plans.length === 0} className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Plus className="mr-1.5 inline h-4 w-4" /> {saving ? "Creating Company..." : "Create Company & Administrator"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({ label, name, value, onChange, type = "text", ...props }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-100"
        {...props}
      />
    </label>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h3 className="font-bold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, hint, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    blue: "border-blue-200 bg-blue-50 text-blue-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
  };
  const iconTones = {
    slate: "bg-slate-950 text-white",
    emerald: "bg-emerald-600 text-white",
    blue: "bg-blue-600 text-white",
    amber: "bg-amber-500 text-white",
    rose: "bg-rose-600 text-white",
  };
  return (
    <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold opacity-70">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{Number(value || 0).toLocaleString()}</p>
          <p className="mt-1 text-xs opacity-60">{hint}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${iconTones[tone]}`}><Icon className="h-5 w-5" /></div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "active").toLowerCase();
  const styles = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    suspended: "border-amber-200 bg-amber-50 text-amber-700",
    inactive: "border-slate-200 bg-slate-100 text-slate-600",
    disabled: "border-slate-200 bg-slate-100 text-slate-600",
    blocked: "border-rose-200 bg-rose-50 text-rose-700",
  };
  const Icon = value === "active" ? CheckCircle2 : value === "blocked" ? Ban : Clock3;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${styles[value] || styles.inactive}`}>
      <Icon className="h-3.5 w-3.5" /> {statusLabel(value)}
    </span>
  );
}

export default function SuperAdminUsers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [busyUserId, setBusyUserId] = useState("");

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["superadmin-users", search, page],
    queryFn: () => getUsers(search, page),
    retry: false,
    staleTime: 15000,
    keepPreviousData: true,
  });
  const {
    data: metricsData,
    isError: metricsError,
    isFetching: metricsFetching,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ["superadmin-dashboard-metrics"],
    queryFn: getSuperAdminDashboardMetrics,
    retry: 1,
    staleTime: 30000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const users = data?.users || data?.data || [];
  const totalUsers = Number(data?.total ?? metricsData?.data?.users ?? 0);
  const pages = Math.max(1, Number(data?.pages || Math.ceil(totalUsers / PAGE_SIZE) || 1));
  const metrics = metricsData?.data || metricsData || {};
  const tenantMap = useMemo(
    () => new Map((metrics.tenants || []).map((tenant) => [String(tenant.tenantId), tenant])),
    [metrics.tenants]
  );

  const refreshAll = async () => {
    await Promise.all([refetch(), refetchMetrics()]);
  };

  const status = async (id, value) => {
    setBusyUserId(id);
    try {
      await updateStatus(id, value);
      await refreshAll();
      toast.success(`User ${value === "active" ? "activated" : "suspended"}.`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to update user status.");
    } finally {
      setBusyUserId("");
    }
  };

  const remove = async (id) => {
    const user = users.find((item) => item._id === id);
    const label = user?.name || user?.email || "this user";
    if (!window.confirm(`Delete ${label} permanently? This action cannot be undone.`)) return;
    setBusyUserId(id);
    try {
      await removeUser(id);
      await refreshAll();
      toast.success("User account deleted successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to delete user.");
    } finally {
      setBusyUserId("");
    }
  };

  const metricFailure = metricsError && !metricsData;

  return (
    <div className="min-h-full bg-slate-50/70 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-[0_22px_70px_-32px_rgba(15,23,42,0.65)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" /> Platform governance
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">SuperAdmin User Management</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Govern platform-wide accounts across all tenants. Review identity, role, company ownership and account state without confusing platform totals with tenant-only metrics.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refreshAll}
                disabled={isFetching || metricsFetching}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
              >
                <RefreshCw className={`mr-2 inline h-4 w-4 ${(isFetching || metricsFetching) ? "animate-spin" : ""}`} /> Refresh
              </button>
              <button
                type="button"
                onClick={() => setShowCreateAccount((current) => !current)}
                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-400"
              >
                <Plus className="mr-1.5 inline h-4 w-4" /> Create Company / Tenant
              </button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Platform scope</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">No tenant filter</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Status controls protected server-side</span>
          </div>
        </header>

        {showCreateAccount && (
          <CompanyTenantForm
            onCancel={() => setShowCreateAccount(false)}
            onCreated={async () => {
              await refreshAll();
              setShowCreateAccount(false);
            }}
          />
        )}

        {metricFailure && (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <Ban className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Platform metrics are unavailable</p>
              <p className="mt-0.5">User records can still be reviewed, but global KPI values are not being replaced with guessed zeros.</p>
            </div>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={Users} title="Total platform users" value={totalUsers} hint="All platform user records" tone="slate" />
          <MetricCard icon={UserCheck} title="Active accounts" value={metricsError ? 0 : metrics.activeUsers} hint="Global account status" tone="emerald" />
          <MetricCard icon={UserCog} title="Active tenant admins" value={metrics.admins} hint="Tenant-owned administrators" tone="blue" />
          <MetricCard icon={Activity} title="Active customer accounts" value={metrics.customerAccounts} hint="Tenant-owned customer users" tone="amber" />
          <MetricCard icon={Building2} title="Customer profiles" value={metrics.customerProfiles} hint="Active, non-deleted profiles" tone="rose" />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Platform accounts</h2>
              <p className="mt-1 text-sm text-slate-500">
                {isError ? "The account list could not be loaded." : `${totalUsers.toLocaleString()} users across the platform${metrics.scope?.tenantCount ? ` and ${Number(metrics.scope.tenantCount).toLocaleString()} active/trial tenants` : ""}.`}
              </p>
            </div>
            <div className="flex w-full max-w-xl items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Search name, email, phone, role or status..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
              {search && (
                <button type="button" onClick={() => { setSearch(""); setPage(1); }} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700">
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {isError ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-600"><Ban className="h-6 w-6" /></div>
              <h3 className="mt-4 font-bold text-slate-950">Unable to load platform users</h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">{error?.response?.data?.message || "The platform user endpoint returned an error."}</p>
              <button type="button" onClick={() => refetch()} className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Try again</button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px]">
                  <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-300">
                    <tr>
                      <th className="px-5 py-4 text-left font-bold">User</th>
                      <th className="px-5 py-4 text-left font-bold">Company / tenant</th>
                      <th className="px-5 py-4 text-left font-bold">Role</th>
                      <th className="px-5 py-4 text-left font-bold">Status</th>
                      <th className="px-5 py-4 text-left font-bold">Created</th>
                      <th className="px-5 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr><td className="px-5 py-16 text-center text-sm text-slate-500" colSpan="6">Loading platform accounts...</td></tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td className="px-5 py-16 text-center" colSpan="6">
                          <div className="mx-auto flex max-w-sm flex-col items-center">
                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-500"><Search className="h-6 w-6" /></div>
                            <p className="mt-3 font-bold text-slate-900">No users found</p>
                            <p className="mt-1 text-sm text-slate-500">Try a different search term or clear the current filter.</p>
                          </div>
                        </td>
                      </tr>
                    ) : users.map((user) => {
                      const role = String(user.role || "customer").toLowerCase();
                      const userStatus = String(user.status || "active").toLowerCase();
                      const tenant = user.tenantId ? tenantMap.get(String(user.tenantId)) : null;
                      const isBusy = busyUserId === user._id;
                      const isSuperAdmin = ["super_admin", "superadmin"].includes(role);
                      return (
                        <tr key={user._id} className="group transition hover:bg-emerald-50/40">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-emerald-700 text-sm font-black text-white">
                                {String(user.name || user.email || "?").trim().charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-bold text-slate-900">{user.name || "Unnamed user"}</p>
                                <p className="truncate text-xs text-slate-500">{user.email || "No email"}{user.phone ? ` • ${user.phone}` : ""}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                              <div>
                                <p className="font-semibold text-slate-800">{tenant?.name || (user.tenantId ? "Tenant unavailable" : "Platform account")}</p>
                                <p className="text-xs text-slate-500">{tenant?.slug || (user.tenantId ? "Tenant record not returned" : "No tenant scope")}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{roleLabel(role)}</span>
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={userStatus} /></td>
                          <td className="px-5 py-4 text-sm text-slate-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {isSuperAdmin ? (
                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
                                  <ShieldCheck className="h-4 w-4" /> Protected
                                </span>
                              ) : (
                                <>
                                  {userStatus !== "active" && (
                                    <button type="button" disabled={isBusy} onClick={() => status(user._id, "active")} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50">Activate</button>
                                  )}
                                  {userStatus === "active" && (
                                    <button type="button" disabled={isBusy} onClick={() => status(user._id, "suspended")} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50">Suspend</button>
                                  )}
                                  <button type="button" disabled={isBusy} onClick={() => remove(user._id)} className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 disabled:opacity-50" title="Delete user">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-4 md:px-5">
                <Pagination page={page} pages={pages} total={totalUsers} pageSize={PAGE_SIZE} onPageChange={setPage} />
              </div>
            </>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <InfoCard icon={ShieldCheck} title="Governance boundary" text="SuperAdmin controls remain platform-wide; ordinary tenant administrators stay tenant-scoped." />
          <InfoCard icon={Ban} title="Account protection" text={`${Number(metrics.blockedUsers || 0).toLocaleString()} blocked accounts and ${Number(metrics.suspendedUsers || 0).toLocaleString()} suspended/inactive accounts are tracked separately from active users.`} />
          <InfoCard icon={ChevronRight} title="Operational rule" text="Account actions are executed by protected API routes; the UI does not treat an unavailable API response as a successful state change." />
        </section>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-slate-950 p-2.5 text-white"><Icon className="h-5 w-5" /></div>
        <div>
          <h3 className="font-bold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}
