import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, UserCheck, UserX, Shield } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios";

export default function StaffManagement() {
  const qc = useQueryClient();
const [search,setSearch] = useState("");

const [searchInput,setSearchInput] = useState("");

useEffect(()=>{
  const timer=setTimeout(()=>{
    setSearch(searchInput);
  },500);

  return ()=>clearTimeout(timer);

},[searchInput]);

  const staffQuery = useQuery({
    queryKey: ["staff", "admin", search],
    queryFn: async () => (await api.get("/staff", {
      params: { includeInactive: true, limit: 100, search: search },
    })).data,
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users", "staff-list", search],
    queryFn: async () => (await api.get("/admin/users", {
      params: { limit: 100, search: search },
    })).data,
  });

  const mutation = useMutation({
    mutationFn: ({ id, active }) =>
      api.put(`/staff/${ id }/status`, { isActive: active, status: active ? "active" : "inactive", availability: active ? "available" : "offline" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff", "admin"] });
      toast.success("Staff status updated.");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Could not update staff."),
  });

  const staff = useMemo(
    () =>
      Array.isArray(staffQuery.data?.data)
        ? staffQuery.data.data
        : [],
    [staffQuery.data]
  );
  const adminUsers = useMemo(
    () =>
      Array.isArray(usersQuery.data?.data)
        ? usersQuery.data.data.filter((u) =>
            [
              "admin",
              "super_admin",
              "super_admin",
              "administrator",
              "tour_manager",
              "manager",
              "agent",
            ].includes(String(u.role || "").toLowerCase())
          )
        : [],
    [usersQuery.data]
  );

  const rows = useMemo(() => {
    const staffRows = staff.map((m) => ({ ...m, rowType: "staff" }));
    const staffEmails = new Set(staff.map((m) => String(m.email || "").toLowerCase()));
    const accountRows = adminUsers
      .filter((u) => !staffEmails.has(String(u.email || "").toLowerCase()))
      .map((u) => ({
        ...u,
        rowType: "account",
        position: u.role || "account",
        availability: "account",
        isActive: u.isActive !== false,
        status: u.status || "active",
      }));
    return [...staffRows, ...accountRows];
  }, [staff, adminUsers]);

  if (staffQuery.isLoading || usersQuery.isLoading) return <div className="p-6">Loading staff...</div>;
  if (staffQuery.isError || usersQuery.isError) return <div className="p-6 text-red-600">Failed to load staff.</div>;

  const active = rows.filter((s) => s.isActive !== false && s.status === "active").length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">People operations</p>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500">Manage operational staff and registered management accounts.</p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[["Total accounts", rows.length], ["Active", active], ["Inactive", rows.length - active]].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex justify-between"><span className="text-sm text-slate-500">{label}</span><Users size={19} className="text-emerald-700" /></div>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <Search size={18} className="text-slate-400" />
          <input
            value={searchInput}
            onChange={(e)=>setSearchInput(e.target.value)}
            placeholder="Search name, email, phone, role or position..."
            className="w-full outline-none"
          />
          {search && <button onClick={() => setSearch("")} className="text-sm text-slate-500">Clear</button>}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-left">Staff member</th>
                  <th className="p-4 text-left">Position / Role</th>
                  <th className="p-4 text-left">Availability</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => {
                  const on = m.isActive !== false && m.status === "active";
                  const isAccount = m.rowType === "account";
                  return (
                    <tr key={`${m.rowType}-${m._id}`} className="border-t hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-semibold">{m.name || "-"}</div>
                        <div className="text-sm text-slate-500">{m.email || "-"} · {m.phone || "-"}</div>
                      </td>
                      <td className="p-4 capitalize">
                        {isAccount ? <><Shield size={15} className="mr-1 inline" />{String(m.role || "account").replace(/_/g, " ")}</> : String(m.position || "-").replace(/_/g, " ")}
                      </td>
                      <td className="p-4 capitalize">{m.availability || "-"}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${on ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {on ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {isAccount ? (
                          <span className="text-xs text-slate-400">Manage in Users</span>
                        ) : (
                          <button
                            onClick={() => mutation.mutate({ id: m._id, active: !on })}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                          >
                            {on ? <><UserX size={15} />Disable</> : <><UserCheck size={15} />Enable</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && <tr><td colSpan="5" className="p-10 text-center text-slate-500">No staff found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
