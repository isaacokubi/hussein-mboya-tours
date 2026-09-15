import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roleUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSuperAdminRoles,
  getSuperAdminRole,
  getSuperAdminPermissions,
  updateSuperAdminRolePermissions,
} from "../../api/superadmin/superAdminRoleApi";
import {
  CheckCircle2,
  ChevronRight,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

const normalizeRoleName = (role) => String(role?.name || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
const permissionId = (permission) => typeof permission === "object" ? String(permission?._id || "") : String(permission || "");

const rolePresentation = (role) => {
  const key = String(role?.name || "").trim().toLowerCase();
  const map = {
    super_admin: { label: "Super Admin", tone: "red", description: "Protected platform-wide governance role." },
    superadmin: { label: "Super Admin", tone: "red", description: "Protected platform-wide governance role." },
    admin: { label: "Administrator", tone: "blue", description: "Tenant administration and operational oversight." },
    tour_manager: { label: "Tour Manager", tone: "violet", description: "Tour planning, assignments and operational management." },
    manager: { label: "Manager", tone: "indigo", description: "Operational management permissions." },
    tour_guide: { label: "Tour Guide", tone: "amber", description: "Tour execution and guest-facing guide operations." },
    guide: { label: "Guide", tone: "orange", description: "Guide-level operational access." },
    agent: { label: "Travel Agent", tone: "emerald", description: "Sales, customer and booking workflows." },
    driver: { label: "Driver", tone: "cyan", description: "Transport and assigned-trip operations." },
    customer: { label: "Customer", tone: "slate", description: "Customer self-service access." },
  };
  return map[key] || { label: role?.displayName || role?.name || "Unnamed role", tone: "slate", description: role?.description || "Custom platform access role." };
};

const toneClasses = {
  red: "border-red-200 bg-red-50 text-red-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

export default function SuperAdminRoles() {
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");

  const isSuperAdmin = normalizeRoleName({ name: getUserRole(user) }) === "superadmin";
  const canManageRoles = isSuperAdmin || hasPermission("roles.manage");

  const { data: roles = [], isLoading: rolesLoading, isError: rolesError, refetch: refetchRoles } = useQuery({
    queryKey: ["superadmin-rbac-roles"], queryFn: getSuperAdminRoles,
  });
  const { data: permissions = [], isLoading: permissionsLoading, isError: permissionsError } = useQuery({
    queryKey: ["superadmin-rbac-permissions"], queryFn: getSuperAdminPermissions,
  });

  const filteredRoles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter((role) => `${role.name} ${role.displayName || ""} ${rolePresentation(role).label}`.toLowerCase().includes(term));
  }, [roles, search]);

  const updateRole = useMutation({
    mutationFn: () => updateSuperAdminRolePermissions(selectedRole._id, selectedPermissions),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["superadmin-rbac-roles"] });
      try {
        const refreshed = await getSuperAdminRole(selectedRole._id);
        setSelectedRole(refreshed);
        setSelectedPermissions((refreshed.permissions || []).map(permissionId));
        setLoadError("");
      } catch (error) {
        setLoadError(error?.response?.data?.message || "Permissions were saved, but the role could not be refreshed.");
      }
    },
    onError: (error) => setLoadError(error?.response?.data?.message || "Unable to update permissions."),
  });

  if (!canManageRoles) return <div className="min-h-[60vh] p-6 lg:p-8"><div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm"><div className="flex items-start gap-4"><ShieldCheck className="mt-0.5" /><div><h2 className="text-lg font-bold">Access denied</h2><p className="mt-1">You do not have permission to manage platform roles.</p></div></div></div></div>;

  const openRole = async (role) => {
    setLoadError("");
    try {
      const fullRole = await getSuperAdminRole(role._id);
      setSelectedRole(fullRole);
      setSelectedPermissions((fullRole.permissions || []).map(permissionId));
    } catch (error) { setLoadError(error?.response?.data?.message || "Unable to load role details."); }
  };

  const selectedIsSuperAdmin = normalizeRoleName(selectedRole) === "superadmin";
  const togglePermission = (id) => {
    if (selectedIsSuperAdmin) return;
    const normalizedId = String(id);
    setSelectedPermissions((previous) => previous.includes(normalizedId) ? previous.filter((permission) => permission !== normalizedId) : [...previous, normalizedId]);
  };

  return (
    <div className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200"><LockKeyhole size={14} /> Access Control</div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Roles &amp; Permissions Center</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">Manage platform-wide access policies with clear role boundaries, protected governance controls and tenant-safe permission updates.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[330px]">
              <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur"><div className="flex items-center gap-2 text-slate-300"><Users size={16} /> Roles</div><div className="mt-1 text-2xl font-black">{roles.length}</div></div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur"><div className="flex items-center gap-2 text-slate-300"><KeyRound size={16} /> Permissions</div><div className="mt-1 text-2xl font-black">{permissions.length}</div></div>
            </div>
          </div>
        </header>

        {loadError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700" role="alert">{loadError}</div>}
        {rolesError && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>Unable to load platform roles. Check authentication and the roles API.</span><button onClick={() => refetchRoles()} className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-3 py-2 font-semibold text-white hover:bg-red-800"><RefreshCw size={15} /> Retry</button></div>}
        {permissionsError && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">The permission catalogue could not be loaded. Role details remain available, but permission changes are temporarily unavailable.</div>}

        <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div><h2 className="text-xl font-black text-slate-900">Platform Roles</h2><p className="mt-1 text-sm text-slate-500">Select a role to inspect and manage its access.</p></div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{filteredRoles.length} shown</span>
            </div>
            <label className="relative mb-5 block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search roles..." aria-label="Search roles" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" /></label>
            {rolesLoading ? <div className="space-y-3">{[1,2,3,4,5].map((item)=><div key={item} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}</div> : filteredRoles.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No roles match your search.</div> : <div className="space-y-3">{filteredRoles.map((role)=>{const presentation=rolePresentation(role); const selected=selectedRole?._id===role._id; const protectedRole=normalizeRoleName(role)==="superadmin"; return <button key={role._id} type="button" onClick={()=>openRole(role)} className={`group w-full rounded-xl border p-4 text-left transition-all ${selected ? "border-indigo-400 bg-indigo-50/70 shadow-md ring-2 ring-indigo-100" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"}`}><div className="flex items-start gap-3"><div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${protectedRole ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}><ShieldCheck size={19} /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="font-bold text-slate-900">{presentation.label}</h3><p className="mt-0.5 text-xs font-medium text-slate-400">{role.name}</p></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold ${toneClasses[presentation.tone]}`}>{protectedRole ? "Protected" : role.isSystem ? "System" : "Custom"}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{presentation.description}</p><div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500"><span>Level {role.level ?? "—"}</span><span>{role.permissions?.length ?? 0} permissions</span></div></div><ChevronRight size={17} className={`mt-3 shrink-0 transition ${selected ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-500"}`} /></div></button>;})}</div>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {!selectedRole ? <div className="flex min-h-[520px] items-center justify-center p-8 text-center"><div className="max-w-md"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><KeyRound size={28} /></div><h2 className="mt-5 text-2xl font-black text-slate-900">Select a role</h2><p className="mt-2 text-sm leading-6 text-slate-500">Choose a role from the left to inspect its permission set and make controlled access changes.</p></div></div> : <div className="p-5 sm:p-6 lg:p-7">
              <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-600"><ShieldCheck size={15} /> Role configuration</div><h2 className="mt-2 text-2xl font-black text-slate-900">{rolePresentation(selectedRole).label}</h2><p className="mt-1 text-sm text-slate-500">{selectedRole.description || rolePresentation(selectedRole).description}</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Code: {selectedRole.name}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Level: {selectedRole.level ?? "—"}</span></div></div>{selectedIsSuperAdmin && <span className="inline-flex items-center gap-2 self-start rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"><LockKeyhole size={14} /> Protected role</span>}</div>
              {permissionsLoading ? <div className="grid gap-3 md:grid-cols-2">{[1,2,3,4,5,6].map((item)=><div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}</div> : permissions.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No permission catalogue entries are available.</div> : <div className="grid gap-3 md:grid-cols-2">{permissions.map((permission)=>{const id=String(permission._id); const checked=selectedPermissions.includes(id); return <label key={id} className={`group flex items-start gap-3 rounded-xl border p-4 transition ${selectedIsSuperAdmin ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70" : checked ? "cursor-pointer border-emerald-300 bg-emerald-50/70 shadow-sm" : "cursor-pointer border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40"}`}><input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" checked={checked} disabled={selectedIsSuperAdmin} onChange={()=>togglePermission(id)} /><span className="min-w-0 flex-1"><span className="flex items-center gap-2 font-semibold text-slate-900">{permission.label || permission.name}{checked && <CheckCircle2 size={15} className="text-emerald-600" />}</span><span className="mt-1 block break-all text-xs font-medium text-slate-500">{permission.name}</span>{permission.description && <span className="mt-1 block text-xs leading-5 text-slate-400">{permission.description}</span>}</span></label>})}</div>}
              <div className="mt-7 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-slate-800">{selectedIsSuperAdmin ? "Protected governance role" : `${selectedPermissions.length} permission${selectedPermissions.length === 1 ? "" : "s"} selected`}</p><p className="mt-1 text-xs text-slate-500">{selectedIsSuperAdmin ? "Super Admin permissions cannot be edited here to prevent accidental platform lockout." : "Changes apply through the platform RBAC service and should follow least-privilege policy."}</p></div><button type="button" onClick={()=>updateRole.mutate()} disabled={selectedIsSuperAdmin || updateRole.isPending || permissionsLoading || permissionsError} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{updateRole.isPending && <RefreshCw size={16} className="animate-spin" />}{updateRole.isPending ? "Saving changes..." : "Save Permissions"}</button></div>
            </div>}
          </section>
        </div>
      </div>
    </div>
  );
}
