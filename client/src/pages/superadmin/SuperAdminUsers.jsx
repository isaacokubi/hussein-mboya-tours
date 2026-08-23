import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

const COMPANY_ACCOUNT_ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Tour Manager" },
  { value: "tour_guide", label: "Tour Guide" },
  { value: "driver", label: "Driver" },
  { value: "agent", label: "Travel Agent" },
  { value: "customer", label: "Customer" },
];

const getUsers = async (search) => (await api.get("/superadmin/users", { params: { search, limit: 100 } })).data;
const updateStatus = async (id, status) => (await api.put(`/superadmin/users/${id}/status`, { status })).data;
const removeUser = async (id) => (await api.delete(`/superadmin/users/${id}`)).data;
const createCompanyAccount = async (payload) => (await api.post("/superadmin/users/accounts", payload)).data;

function CompanyAccountForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "admin" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = ({ target: { name, value } }) => setForm((current) => ({ ...current, [name]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createCompanyAccount(form);
      await onCreated?.();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to create company account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div><h2 className="text-lg font-semibold">Create Company Account</h2><p className="text-sm text-gray-500">Create an account for this platform. Super Admin accounts are excluded.</p></div>
        <button type="button" onClick={onCancel} className="rounded-lg border px-3 py-2 text-sm">Cancel</button>
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1"><span className="text-sm font-medium">Full Name</span><input name="name" value={form.name} onChange={handleChange} required className="rounded-lg border px-3 py-2" /></label>
        <label className="flex flex-col gap-1"><span className="text-sm font-medium">Email</span><input type="email" name="email" value={form.email} onChange={handleChange} required className="rounded-lg border px-3 py-2" /></label>
        <label className="flex flex-col gap-1"><span className="text-sm font-medium">Phone Number</span><input name="phone" value={form.phone} onChange={handleChange} required maxLength={10} inputMode="numeric" className="rounded-lg border px-3 py-2" /></label>
        <label className="flex flex-col gap-1"><span className="text-sm font-medium">Password</span><input type="password" name="password" value={form.password} onChange={handleChange} required minLength={12} className="rounded-lg border px-3 py-2" /></label>
        <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm font-medium">Account Type</span><select name="role" value={form.role} onChange={handleChange} className="rounded-lg border px-3 py-2">{COMPANY_ACCOUNT_ROLES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <div className="flex justify-end gap-3 md:col-span-2"><button type="button" onClick={onCancel} disabled={saving} className="rounded-lg border px-4 py-2">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50">{saving ? "Creating..." : "Create Account"}</button></div>
      </form>
    </div>
  );
}

export default function SuperAdminUsers() {
  const [search, setSearch] = useState("");
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["superadmin-users", search], queryFn: () => getUsers(search), retry: false, staleTime: 15000 });
  const users = data?.users || data?.data || [];

  const status = async (id, value) => { await updateStatus(id, value); refetch(); };
  const remove = async (id) => { if (window.confirm("Delete this user permanently?")) { await removeUser(id); refetch(); } };

  const active = users.filter((u) => (u.status || "active") === "active").length;
  const admins = users.filter((u) => String(u.role || "").toLowerCase().includes("admin")).length;
  const customers = users.filter((u) => String(u.role || "").toLowerCase() === "customer").length;

  return <div className="space-y-6 p-8">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h1 className="text-3xl font-bold">SuperAdmin User Management</h1><p className="mt-1 text-sm text-gray-500">Manage all platform users without tenant-scoped filtering.</p></div><button type="button" onClick={() => setShowCreateAccount(true)} className="rounded-xl bg-black px-5 py-3 font-medium text-white shadow-sm">+ Create Company Account</button></div>
    {showCreateAccount && <CompanyAccountForm onCancel={() => setShowCreateAccount(false)} onCreated={async () => { await refetch(); setShowCreateAccount(false); }} />}
    <div className="grid gap-4 md:grid-cols-4"><Card title="Total Users" value={users.length} /><Card title="Active" value={active} /><Card title="Admins" value={admins} /><Card title="Customers" value={customers} /></div>
    <input className="w-full rounded-xl border p-3" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
    <div className="overflow-auto rounded-xl bg-white shadow">
      {isError ? <div className="p-6 text-red-700">{error?.response?.data?.message || "Unable to load platform users."}</div> : <table className="w-full"><thead className="bg-gray-100"><tr><th className="p-4 text-left">Name</th><th className="text-left">Email</th><th className="text-left">Role</th><th className="text-left">Status</th><th className="text-left">Actions</th></tr></thead><tbody>{isLoading ? <tr><td className="p-5" colSpan="5">Loading...</td></tr> : users.length === 0 ? <tr><td className="p-5 text-gray-500" colSpan="5">No platform users found.</td></tr> : users.map((u) => <tr className="border-t" key={u._id}><td className="p-4">{u.name || "—"}</td><td>{u.email || "—"}</td><td><span className="rounded-full bg-blue-100 px-3 py-1">{u.role || "customer"}</span></td><td>{u.status || "active"}</td><td className="space-x-2"><button className="rounded border px-3 py-1" onClick={() => status(u._id, "active")}>Activate</button><button className="rounded border px-3 py-1" onClick={() => status(u._id, "suspended")}>Suspend</button><button className="rounded bg-red-500 px-3 py-1 text-white" onClick={() => remove(u._id)}>Delete</button></td></tr>)}</tbody></table>}
    </div>
  </div>;
}

function Card({ title, value }) { return <div className="rounded-xl border bg-white p-5"><p className="text-gray-500">{title}</p><h2 className="text-3xl font-bold">{value}</h2></div>; }
