import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Trash2, UserCheck, UserX, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { getAdminUsers, updateUserStatus, deleteUser, createStaffAccount } from "../../api/adminUserApi";

const roles = ["admin", "manager", "agent", "guide", "driver"];

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "guide" });
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["admin-users", debouncedSearch, page],
    queryFn: () => getAdminUsers({ search: debouncedSearch, page, limit: 10 }),
    placeholderData: (previous) => previous,
    staleTime: 15_000,
  });

  const users = Array.isArray(data?.data) ? data.data : Array.isArray(data?.users) ? data.users : [];
  const totalPages = Math.max(1, Number(data?.pages || data?.pagination?.pages || 1));

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateUserStatus({ id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User status updated.");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Could not update user."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onMutate: async (userId) => {
      const key = ["admin-users", debouncedSearch, page];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (current) => {
        if (!current) return current;
        const currentUsers = Array.isArray(current.data) ? current.data : Array.isArray(current.users) ? current.users : [];
        const filtered = currentUsers.filter((user) => user._id !== userId);
        return { ...current, data: filtered, users: filtered, count: filtered.length, total: Math.max(0, Number(current.total || 0) - 1) };
      });
      return { previous, key };
    },
    onError: (e, _userId, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
      toast.error(e?.response?.data?.message || "Could not delete user.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "admin"] });
      toast.success("User deleted successfully.");
    },
  });

  const createMutation = useMutation({
    mutationFn: createStaffAccount,
    onSuccess: () => {
      setShowCreate(false);
      setForm({ name: "", email: "", phone: "", password: "", role: "guide" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "admin"] });
      toast.success("Account created successfully.");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Could not create account."),
  });

  if (isLoading) return <div className="p-8">Loading users...</div>;
  if (isError) return <div className="p-8 text-red-600">Failed to load users.</div>;

  return (
    <section className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Administration</p><h1 className="text-3xl font-bold text-slate-900">User & Staff Management</h1><p className="mt-1 text-slate-500">Search, control access and create operational accounts.</p></div>
        <button type="button" onClick={() => setShowCreate(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow hover:bg-emerald-800"><UserPlus size={18}/> Create user account</button>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2">
          <Search className="text-slate-400" size={19}/>
          <input
            type="search"
            autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, phone, role or status..."
            className="w-full p-2 outline-none"
          />
          {search && <button type="button" onClick={() => { setSearch(""); setPage(1); }} className="whitespace-nowrap text-sm text-slate-500">Clear</button>}
        </div>
        {isFetching && <p className="mt-2 text-xs text-slate-500" aria-live="polite">Updating results…</p>}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-50"><tr><th className="whitespace-nowrap p-4 text-left">User</th><th className="whitespace-nowrap p-4 text-left">Role</th><th className="whitespace-nowrap p-4 text-left">Phone</th><th className="whitespace-nowrap p-4 text-left">Status</th><th className="whitespace-nowrap p-4 text-right">Actions</th></tr></thead>
            <tbody>{users.map(user => <tr key={user._id} className="border-t hover:bg-slate-50"><td className="whitespace-nowrap p-4"><div className="font-semibold">{user.name}</div><div className="text-sm text-slate-500">{user.email}</div></td><td className="whitespace-nowrap p-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize">{String(user.role || "customer").replace(/_/g, " ")}</span></td><td className="whitespace-nowrap p-4">{user.phone || "-"}</td><td className="whitespace-nowrap p-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{user.isActive ? "Active" : "Disabled"}</span></td><td className="whitespace-nowrap p-4 text-right"><div className="flex justify-end gap-2"><button type="button" title={user.isActive ? "Disable" : "Enable"} onClick={() => statusMutation.mutate({ id: user._id, status: user.isActive ? "disabled" : "active" })} className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200">{user.isActive ? <UserX size={18}/> : <UserCheck size={18}/>}</button><button type="button" title="Delete" disabled={deleteMutation.isPending && deleteMutation.variables === user._id} onClick={() => window.confirm("Delete this user permanently? Historical bookings and payments will be preserved.") && deleteMutation.mutate(user._id)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50"><Trash2 size={18}/></button></div></td></tr>)}{!users.length && <tr><td colSpan="5" className="p-10 text-center text-slate-500">No users match your search.</td></tr>}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t p-4"><span className="text-sm text-slate-500">Page {page} of {totalPages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={18}/></button><button type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={18}/></button></div></div>
      </div>

      {showCreate && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"><form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Create user account</h2><button type="button" onClick={() => setShowCreate(false)} className="text-2xl">×</button></div><p className="mt-1 text-sm text-slate-500">Create an admin, manager, agent, guide or driver login.</p><div className="mt-5 grid gap-4"><input required placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="rounded-lg border p-3"/><input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="rounded-lg border p-3"/><input required inputMode="numeric" maxLength={10} placeholder="10-digit phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="rounded-lg border p-3"/><input required minLength={8} type="password" placeholder="Temporary password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="rounded-lg border p-3"/><select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="rounded-lg border p-3">{roles.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}</select></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2">Cancel</button><button type="submit" disabled={createMutation.isPending} className="rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white disabled:opacity-50">{createMutation.isPending ? "Creating..." : "Create account"}</button></div></form></div>}
    </section>
  );
}
