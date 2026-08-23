import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Save } from "lucide-react";
import { toast } from "react-toastify";
import { getAdminRoles, getAdminPermissions, updateAdminRolePermissions } from "../../api/admin/adminRoleApi";

export default function RolesPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: getAdminRoles });
  const permissionsQuery = useQuery({ queryKey: ["admin-permissions"], queryFn: getAdminPermissions });
  const roles = rolesQuery.data?.roles || [];
  const permissions = useMemo(() => permissionsQuery.data?.permissions || [], [permissionsQuery.data]);
  const grouped = useMemo(
    () => permissions.reduce((a, p) => { const k = p.module || p.category || "other"; (a[k] ||= []).push(p); return a; }, {}),
    [permissions]
  );
  const effectiveSelected = selected || (() => {
    const superRole = roles.find(r => ["super_admin", "super_admin"].includes(String(r.name).toLowerCase()));
    return superRole?._id || superRole?.id || roles[0]?._id || roles[0]?.id || null;
  })();

  const mutation = useMutation({
    mutationFn: ({ id, permissions: ids }) => updateAdminRolePermissions(id, ids),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-roles"] }); toast.success("Role permissions updated."); },
    onError: e => toast.error(e?.response?.data?.message || "Could not update permissions."),
  });

  if (rolesQuery.isLoading || permissionsQuery.isLoading) return <div className="p-6">Loading roles and permissions...</div>;
  if (rolesQuery.isError || permissionsQuery.isError) {
    const rolesError = rolesQuery.error?.response?.data?.message || rolesQuery.error?.message;
    const permissionsError = permissionsQuery.error?.response?.data?.message || permissionsQuery.error?.message;
    return <div className="p-6 text-red-600"><h2 className="text-xl font-bold">Failed to load roles and permissions.</h2><p className="mt-2 text-sm">Roles: {rolesError || "Unknown error"}</p><p className="text-sm">Permissions: {permissionsError || "Unknown error"}</p></div>;
  }

  return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl">
    <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Access control</p><h1 className="text-3xl font-bold text-slate-900">Roles & Permissions Center</h1><p className="text-slate-500">Assign exactly what each operational role can access.</p></div>
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-3">{roles.map(role => { const id = role._id || role.id; return <button key={id} onClick={() => setSelected(id)} className={`w-full rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 ${effectiveSelected === id ? "ring-2 ring-emerald-600" : ""}`}><div className="flex items-center justify-between"><div><div className="font-bold capitalize">{String(role.displayName || role.name).replace(/_/g, " ")}</div><div className="mt-1 text-sm text-slate-500">{role.permissions?.length || 0} permissions</div></div><ShieldCheck className="text-emerald-700" /></div></button>; })}</div>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {!effectiveSelected ? <div className="py-16 text-center text-slate-500">Select a role to manage its permissions.</div> : <PermissionEditor role={roles.find(r => (r._id || r.id) === effectiveSelected)} grouped={grouped} mutation={mutation} />}
      </div>
    </div>
  </div></div>;
}

function PermissionEditor({ role, grouped, mutation }) {
  const initial = new Set((role?.permissions || []).map(p => p._id || p.id));
  const [checked, setChecked] = useState(initial);
  useEffect(() => {
    // Role changes are an external selection change; synchronize the editor state once.

    setChecked(new Set((role?.permissions || []).map(p => p._id || p.id)));
  }, [role?._id, role?.permissions]);
  const allIds = Object.values(grouped).flat().map(p => p._id || p.id);
  const toggle = id => setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return <><div className="mb-5 flex items-center justify-between"><div><h2 className="text-2xl font-bold">{role?.displayName || role?.name}</h2><p className="text-sm text-slate-500">Choose permissions for this role.</p></div><button onClick={() => mutation.mutate({ id: role._id || role.id, permissions: [...checked] })} disabled={mutation.isPending} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-40"><Save size={17} />{mutation.isPending ? "Saving..." : "Save permissions"}</button></div><div className="mb-4 flex gap-2"><button onClick={() => setChecked(new Set(allIds))} className="rounded-lg border px-3 py-2 text-sm">Select all</button><button onClick={() => setChecked(new Set())} className="rounded-lg border px-3 py-2 text-sm">Clear</button></div><div className="space-y-5">{Object.entries(grouped).map(([module, items]) => <div key={module}><h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">{module}</h3><div className="grid gap-2 md:grid-cols-2">{items.map(p => { const id = p._id || p.id; return <label key={id} className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 hover:bg-slate-50"><input type="checkbox" checked={checked.has(id)} onChange={() => toggle(id)} /><span><span className="block font-medium">{p.label || p.name}</span><span className="text-xs text-slate-500">{p.description}</span></span></label>; })}</div></div>)}</div></>;
}
