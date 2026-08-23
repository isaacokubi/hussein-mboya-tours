import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { createSuperAdminTenant, getSuperAdminTenantPlans } from "../../api/superAdminTenantsApi";

const getUsers = async (search) => (await api.get("/superadmin/users", { params: { search, limit: 100 } })).data;
const updateStatus = async (id, status) => (await api.put(`/superadmin/users/${id}/status`, { status })).data;
const removeUser = async (id) => (await api.delete(`/superadmin/users/${id}`)).data;
const PLATFORM_HOST = String(import.meta.env.VITE_PLATFORM_HOST || "globaltours.com").replace(/^https?:\/\//, "").replace(/\/$/, "");

const INITIAL_FORM = {
  companyName: "", legalName: "", slug: "", companyEmail: "", companyPhone: "", domain: "",
  country: "Kenya", timezone: "Africa/Nairobi", currency: "KES", plan: "starter", seats: 5,
  websiteUrl: "", adminName: "", adminEmail: "", adminPhone: "", adminPassword: "",
};

function CompanyTenantForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { data: planData, isLoading: plansLoading, isError: plansError } = useQuery({ queryKey: ["superadmin-tenant-plans"], queryFn: getSuperAdminTenantPlans, staleTime: 10 * 60 * 1000, retry: 1 });
  const plans = planData?.plans || [];
  const selectedPlan = plans.find((plan) => plan.value === form.plan);
  const tenantSlug = String(form.slug || form.companyName || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const platformUrl = tenantSlug ? `https://${tenantSlug}.${PLATFORM_HOST}` : `https://<company-slug>.${PLATFORM_HOST}`;

  const handleChange = ({ target: { name, value } }) => {
    if (name === "plan") {
      const nextPlan = plans.find((plan) => plan.value === value);
      setForm((current) => ({ ...current, plan: value, seats: nextPlan?.seats || current.seats }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const result = await createSuperAdminTenant({ ...form, seats: Number(form.seats) });
      toast.success(result.message || "Company created successfully.");
      await onCreated?.(); setForm(INITIAL_FORM);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Unable to create company.";
      setError(message); toast.error(message);
    } finally { setSaving(false); }
  };

  return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-6 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">Create Company / Tenant</h2><p className="mt-1 text-sm text-slate-500">Creates an isolated company workspace and its initial administrator. The administrator is automatically assigned to the new tenant.</p></div><button type="button" onClick={onCancel} className="rounded-lg border px-3 py-2 text-sm">Cancel</button></div>
    {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <form onSubmit={submit} className="space-y-6">
      <section><h3 className="mb-3 font-semibold text-slate-900">Company Information</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} required placeholder="e.g. Africa Safaris Ltd" />
        <Field label="Legal Name" name="legalName" value={form.legalName} onChange={handleChange} placeholder="Registered legal name (optional)" />
        <Field label="Company Email" type="email" name="companyEmail" value={form.companyEmail} onChange={handleChange} required placeholder="info@company.com" />
        <Field label="Company Phone" name="companyPhone" value={form.companyPhone} onChange={handleChange} required maxLength={10} inputMode="numeric" placeholder="0712345678" />
        <Field label="Company Slug" name="slug" value={form.slug} onChange={handleChange} placeholder="Optional; generated from company name" />
        <Field label="Website" name="websiteUrl" value={form.websiteUrl} onChange={handleChange} placeholder="https://example.com" />
        <Field label="Country" name="country" value={form.country} onChange={handleChange} required />
        <Field label="Currency" name="currency" value={form.currency} onChange={handleChange} required maxLength={3} />
        <Field label="Timezone" name="timezone" value={form.timezone} onChange={handleChange} required />
        <Field label="Custom Domain (optional)" name="domain" value={form.domain} onChange={handleChange} placeholder="www.example.com" />
        <label className="flex flex-col gap-1"><span className="text-sm font-medium">Subscription Plan</span><select name="plan" value={form.plan} onChange={handleChange} disabled={plansLoading || plans.length === 0} className="rounded-lg border px-3 py-2 disabled:bg-slate-100">{plans.length > 0 ? plans.map((plan) => <option key={plan.value} value={plan.value}>{plan.label}</option>) : <option value="starter">Starter</option>}</select>{plansError && <span className="text-xs text-amber-600">Unable to load current plan configuration. Server-side validation will still apply.</span>}</label>
        <label className="flex flex-col gap-1"><span className="text-sm font-medium text-slate-700">User Seats</span><input type="number" name="seats" value={form.seats} onChange={handleChange} required min={selectedPlan?.seats || 1} max={10000} className="rounded-lg border px-3 py-2" />{selectedPlan && <span className="text-xs text-slate-500">{selectedPlan.label} includes {selectedPlan.seats} seats minimum. You can increase the seat limit for this company.{selectedPlan.customSeats ? " Enterprise supports custom seat counts." : ""}</span>}</label>
      </div></section>

      <section className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><h3 className="font-semibold text-emerald-950">Tenant URL</h3><p className="mt-1 text-sm text-emerald-900">Every company gets a unique platform URL based on its slug.</p><div className="mt-3 rounded-lg bg-white px-4 py-3 font-mono text-sm break-all">{platformUrl}</div>{form.domain && <p className="mt-2 text-xs text-emerald-800">Custom domain: <strong>{form.domain}</strong>. Point its DNS to the platform and the server will resolve it to this tenant.</p>}<p className="mt-2 text-xs text-emerald-800">Production DNS must provide a wildcard record such as <code>*.{PLATFORM_HOST}</code> to the frontend.</p></section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-semibold text-slate-900">Seat Capacity</h3><p className="mt-1 text-sm text-slate-600">The selected plan automatically sets the recommended seat capacity. You can override it upward when a company needs more staff accounts.</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{plans.map((plan) => <div key={plan.value} className={`rounded-lg border bg-white p-3 ${form.plan === plan.value ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"}`}><p className="text-sm font-medium text-slate-700">{plan.label}</p><p className="text-lg font-bold text-slate-900">{plan.seats}{plan.customSeats ? "+" : ""} seats</p>{plan.customSeats && <p className="text-xs text-slate-500">Custom capacity</p>}</div>)}</div></section>

      <section className="border-t pt-6"><h3 className="mb-1 font-semibold text-slate-900">Primary Administrator</h3><p className="mb-3 text-sm text-slate-500">This user will administer only the newly created company.</p><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Full Name" name="adminName" value={form.adminName} onChange={handleChange} required placeholder="Company administrator" /><Field label="Email" type="email" name="adminEmail" value={form.adminEmail} onChange={handleChange} required placeholder="admin@company.com" /><Field label="Phone Number" name="adminPhone" value={form.adminPhone} onChange={handleChange} required maxLength={10} inputMode="numeric" placeholder="0712345678" /><Field label="Temporary Password" type="password" name="adminPassword" value={form.adminPassword} onChange={handleChange} required minLength={12} placeholder="12+ chars, upper/lowercase and number" /></div></section>

      <div className="flex justify-end gap-3 border-t pt-5"><button type="button" onClick={onCancel} disabled={saving} className="rounded-lg border px-4 py-2">Cancel</button><button type="submit" disabled={saving || plansLoading || plans.length === 0} className="rounded-lg bg-black px-5 py-2 font-medium text-white disabled:opacity-50">{saving ? "Creating Company..." : "Create Company & Administrator"}</button></div>
    </form>
  </div>;
}

function Field({ label, name, value, onChange, type = "text", ...props }) { return <label className="flex flex-col gap-1"><span className="text-sm font-medium text-slate-700">{label}</span><input type={type} name={name} value={value} onChange={onChange} className="rounded-lg border px-3 py-2" {...props} /></label>; }

export default function SuperAdminUsers() {
  const [search, setSearch] = useState(""); const [showCreateAccount, setShowCreateAccount] = useState(false);
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["superadmin-users", search], queryFn: () => getUsers(search), retry: false, staleTime: 15000 });
  const users = data?.users || data?.data || [];
  const status = async (id, value) => { await updateStatus(id, value); refetch(); };
  const remove = async (id) => { if (window.confirm("Delete this user permanently?")) { await removeUser(id); refetch(); } };
  const active = users.filter((u) => (u.status || "active") === "active").length;
  const admins = users.filter((u) => String(u.role || "").toLowerCase().includes("admin")).length;
  const customers = users.filter((u) => String(u.role || "").toLowerCase() === "customer").length;

  return <div className="space-y-6 p-8"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h1 className="text-3xl font-bold">SuperAdmin User Management</h1><p className="mt-1 text-sm text-gray-500">Manage all platform users without tenant-scoped filtering.</p></div><button type="button" onClick={() => setShowCreateAccount(true)} className="rounded-xl bg-black px-5 py-3 font-medium text-white shadow-sm">+ Create Company / Tenant</button></div>
    {showCreateAccount && <CompanyTenantForm onCancel={() => setShowCreateAccount(false)} onCreated={async () => { await refetch(); setShowCreateAccount(false); }} />}
    <div className="grid gap-4 md:grid-cols-4"><Card title="Total Users" value={users.length} /><Card title="Active" value={active} /><Card title="Admins" value={admins} /><Card title="Customers" value={customers} /></div>
    <input className="w-full rounded-xl border p-3" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
    <div className="overflow-auto rounded-xl bg-white shadow">{isError ? <div className="p-6 text-red-700">{error?.response?.data?.message || "Unable to load platform users."}</div> : <table className="w-full"><thead className="bg-gray-100"><tr><th className="p-4 text-left">Name</th><th className="text-left">Email</th><th className="text-left">Role</th><th className="text-left">Status</th><th className="text-left">Actions</th></tr></thead><tbody>{isLoading ? <tr><td className="p-5" colSpan="5">Loading...</td></tr> : users.length === 0 ? <tr><td className="p-5 text-gray-500" colSpan="5">No platform users found.</td></tr> : users.map((u) => <tr className="border-t" key={u._id}><td className="p-4">{u.name || "—"}</td><td>{u.email || "—"}</td><td><span className="rounded-full bg-blue-100 px-3 py-1">{u.role || "customer"}</span></td><td>{u.status || "active"}</td><td className="space-x-2"><button className="rounded border px-3 py-1" onClick={() => status(u._id, "active")}>Activate</button><button className="rounded border px-3 py-1" onClick={() => status(u._id, "suspended")}>Suspend</button><button className="rounded bg-red-500 px-3 py-1 text-white" onClick={() => remove(u._id)}>Delete</button></td></tr>)}</tbody></table>}</div>
  </div>;
}

function Card({ title, value }) { return <div className="rounded-xl border bg-white p-5"><p className="text-gray-500">{title}</p><h2 className="text-3xl font-bold">{value}</h2></div>; }