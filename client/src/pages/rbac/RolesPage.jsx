/**
 * Purpose: Roles Page page-level UI component. Main declarations: permissionId, permissionLabel, permissionDescription, roleId, roleKey.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useMemo, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import {
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Filter,
  KeyRound,
  LockKeyhole,
  Save,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../../api/admin/adminRoleApi so this module can use its exported dependencies.
import { getAdminRoles, getAdminPermissions, updateAdminRolePermissions } from "../../api/admin/adminRoleApi";

// Declare ROLE_META for use by the surrounding module or function.
const ROLE_META = {
  super_admin: { tone: "violet", description: "Full platform control, including security and access policies." },
  superadmin: { tone: "violet", description: "Full platform control, including security and access policies." },
  admin: { tone: "emerald", description: "Business administration and day-to-day operational control." },
  manager: { tone: "blue", description: "Operational management across tours, customers and resources." },
  tour_manager: { tone: "blue", description: "Operational management across tours, customers and resources." },
  guide: { tone: "amber", description: "Assigned tour and guest operations for field teams." },
  tour_guide: { tone: "amber", description: "Assigned tour and guest operations for field teams." },
  agent: { tone: "cyan", description: "Sales, agent tours, commissions and customer bookings." },
  travel_agent: { tone: "cyan", description: "Sales, agent tours, commissions and customer bookings." },
  driver: { tone: "slate", description: "Assigned transport and trip execution tasks." },
  customer: { tone: "slate", description: "Customer self-service access only." },
};

// Declare toneClasses for use by the surrounding module or function.
const toneClasses = {
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

// Declare permissionId for use by the surrounding module or function.
const permissionId = (permission) => {
  // Check the condition (permission == null) and run the matching branch.
  if (permission == null) return null;
  // Check the condition (typeof permission === "string") and run the matching branch.
  if (typeof permission === "string") return permission;
  // Return the expression shown below to the caller.
  return permission._id || permission.id || permission.key || permission.name || null;
};

// Declare permissionLabel for use by the surrounding module or function.
const permissionLabel = (permission) =>
  permission?.label || permission?.displayName || permission?.name || permission?.key || "Unnamed permission";

// Declare permissionDescription for use by the surrounding module or function.
const permissionDescription = (permission) => permission?.description || permission?.helpText || "Controls access to this capability.";

// Declare roleId for use by the surrounding module or function.
const roleId = (role) => role?._id || role?.id || null;

// Declare roleKey for use by the surrounding module or function.
const roleKey = (role) => String(role?.name || role?.key || "").toLowerCase().replace(/\s+/g, "_");

// Declare prettyName for use by the surrounding module or function.
const prettyName = (role) => String(role?.displayName || role?.name || "Role").replace(/_/g, " ");

// Define RolesPage; its parameters and body implement this operation.
export default function RolesPage() {
  // Declare qc for use by the surrounding module or function.
  const qc = useQueryClient();
  // Declare [selected, setSelected] for use by the surrounding module or function.
  const [selected, setSelected] = useState(null);
  // Declare [search, setSearch] for use by the surrounding module or function.
  const [search, setSearch] = useState("");
  // Declare [moduleFilter, setModuleFilter] for use by the surrounding module or function.
  const [moduleFilter, setModuleFilter] = useState("all");
  // Declare [showOnlySelected, setShowOnlySelected] for use by the surrounding module or function.
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  // Declare rolesQuery for use by the surrounding module or function.
  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: getAdminRoles });
  // Declare permissionsQuery for use by the surrounding module or function.
  const permissionsQuery = useQuery({ queryKey: ["admin-permissions"], queryFn: getAdminPermissions });

  // Declare roles for use by the surrounding module or function.
  const roles = useMemo(() => {
    // Declare value for use by the surrounding module or function.
    const value = rolesQuery.data?.roles || rolesQuery.data?.data || rolesQuery.data || [];
    // Return the expression shown below to the caller.
    return Array.isArray(value) ? value : [];
  }, [rolesQuery.data]);

  // Declare permissions for use by the surrounding module or function.
  const permissions = useMemo(() => {
    // Declare value for use by the surrounding module or function.
    const value = permissionsQuery.data?.permissions || permissionsQuery.data?.data || permissionsQuery.data || [];
    // Return the expression shown below to the caller.
    return Array.isArray(value) ? value : [];
  }, [permissionsQuery.data]);

  // Declare grouped for use by the surrounding module or function.
  const grouped = useMemo(
    () => permissions.reduce((acc, permission) => {
      // Declare key for use by the surrounding module or function.
      const key = permission?.module || permission?.category || String(permission?.name || "other").split(/[._]/)[0] || "other";
      // Perform the side effect or state update expressed on the following line.
      (acc[key] ||= []).push(permission);
      // Return the value of acc to the caller.
      return acc;
    }, {}),
    [permissions]
  );

  // Declare modules for use by the surrounding module or function.
  const modules = useMemo(() => Object.keys(grouped).sort((a, b) => a.localeCompare(b)), [grouped]);

  // Declare effectiveSelected for use by the surrounding module or function.
  const effectiveSelected = useMemo(() => {
    // Check the condition (selected && roles.some((role) => roleId(role) === selected)) and run the matching branch.
    if (selected && roles.some((role) => roleId(role) === selected)) return selected;
    // Declare preferred for use by the surrounding module or function.
    const preferred = roles.find((role) => ["super_admin", "superadmin"].includes(roleKey(role)));
    // Return the expression shown below to the caller.
    return roleId(preferred) || roleId(roles[0]);
  }, [roles, selected]);

  // Declare activeRole for use by the surrounding module or function.
  const activeRole = roles.find((role) => roleId(role) === effectiveSelected);
  // Declare activePermissionIds for use by the surrounding module or function.
  const activePermissionIds = useMemo(
    () => new Set((activeRole?.permissions || []).map(permissionId).filter(Boolean)),
    [activeRole]
  );

  // Declare filteredGrouped for use by the surrounding module or function.
  const filteredGrouped = useMemo(() => {
    // Declare needle for use by the surrounding module or function.
    const needle = search.trim().toLowerCase();
    // Return the result of Object.entries(grouped).reduce() to the caller.
    return Object.entries(grouped).reduce((acc, [module, items]) => {
      // Check the condition (moduleFilter !== "all" && module !== moduleFilter) and run the matching branch.
      if (moduleFilter !== "all" && module !== moduleFilter) return acc;
      // Declare filtered for use by the surrounding module or function.
      const filtered = items.filter((permission) => {
        // Declare matchesSearch for use by the surrounding module or function.
        const matchesSearch = !needle || [permissionLabel(permission), permission?.name, permission?.key, permission?.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle);
        // Declare matchesSelected for use by the surrounding module or function.
        const matchesSelected = !showOnlySelected || activePermissionIds.has(permissionId(permission));
        // Return the expression shown below to the caller.
        return matchesSearch && matchesSelected;
      });
      // Check the condition (filtered.length) and run the matching branch.
      if (filtered.length) acc[module] = filtered;
      // Return the value of acc to the caller.
      return acc;
    }, {});
  }, [grouped, search, moduleFilter, showOnlySelected, activePermissionIds]);

  // Declare mutation for use by the surrounding module or function.
  const mutation = useMutation({
    mutationFn: ({ id, permissions: ids }) => updateAdminRolePermissions(id, ids),
    onSuccess: (response) => {
      // Perform the side effect or state update expressed on the following line.
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      // Perform the side effect or state update expressed on the following line.
      toast.success(response?.message || "Role permissions saved successfully.");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Could not save role permissions."),
  });

  // Check the condition (rolesQuery.isLoading || permissionsQuery.isLoading) and run the matching branch.
  if (rolesQuery.isLoading || permissionsQuery.isLoading) {
    // Return the expression shown below to the caller.
    return <LoadingState />;
  }

  // Check the condition (rolesQuery.isError || permissionsQuery.isError) and run the matching branch.
  if (rolesQuery.isError || permissionsQuery.isError) {
    // Declare rolesError for use by the surrounding module or function.
    const rolesError = rolesQuery.error?.response?.data?.message || rolesQuery.error?.message;
    // Declare permissionsError for use by the surrounding module or function.
    const permissionsError = permissionsQuery.error?.response?.data?.message || permissionsQuery.error?.message;
    // Return the expression shown below to the caller.
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <CircleAlert className="mt-0.5 text-red-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">Unable to load access control</h1>
              <p className="mt-1 text-sm text-slate-600">The role and permission services did not return usable data.</p>
              <div className="mt-4 space-y-1 text-sm text-red-700">
                <p>Roles: {rolesError || "Unknown error"}</p>
                <p>Permissions: {permissionsError || "Unknown error"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check the condition (!roles.length) and run the matching branch.
  if (!roles.length) {
    // Return the expression shown below to the caller.
    return <EmptyState title="No roles configured" description="Create or provision an operational role before assigning permissions." />;
  }

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200 ring-1 ring-white/10">
                <LockKeyhole size={14} /> Access control
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Roles &amp; Permissions</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Centrally manage least-privilege access for administrators and operational teams. Changes apply to the selected role after saving.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Roles" value={roles.length} icon={Users} />
              <Stat label="Permissions" value={permissions.length} icon={KeyRound} />
              <Stat label="Modules" value={modules.length} icon={ShieldCheck} />
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Operational roles</h2>
                <p className="text-xs text-slate-500">Select a role to configure</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{roles.length}</span>
            </div>
            <div className="space-y-2">
              {roles.map((role) => {
                const id = roleId(role);
                const key = roleKey(role);
                const meta = ROLE_META[key] || ROLE_META.slate;
                const selectedRole = effectiveSelected === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setSelected(id)}
                    className={`group w-full rounded-xl border p-4 text-left transition ${selectedRole ? "border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-100" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${toneClasses[meta.tone]}`}>
                        <ShieldCheck size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate font-bold capitalize text-slate-900">{prettyName(role)}</span>
                          {selectedRole ? <Check size={17} className="text-emerald-700" /> : <ChevronRight size={17} className="text-slate-300 group-hover:text-slate-500" />}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{meta.description}</span>
                        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {(role?.permissions || []).map(permissionId).filter(Boolean).length} assigned
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold capitalize text-slate-950">{prettyName(activeRole)}</h2>
                    {roleKey(activeRole) === "super_admin" || roleKey(activeRole) === "superadmin" ? (
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-200">Highest privilege</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Assign only the capabilities required for this role.</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Assigned</span>
                  <span className="text-lg font-bold text-slate-900">{activePermissionIds.size}</span>
                  <span className="text-xs text-slate-400">/ {permissions.length}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 lg:flex-row">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search permission, key or description..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  />
                  {search ? <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Clear search"><X size={17} /></button> : null}
                </label>
                <div className="relative lg:w-56">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50">
                    <option value="all">All modules</option>
                    {modules.map((module) => <option key={module} value={module}>{module}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                  <input type="checkbox" checked={showOnlySelected} onChange={(event) => setShowOnlySelected(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  Show assigned only
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setShowOnlySelected(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">View all</button>
                  <button type="button" onClick={() => setShowOnlySelected(true)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Review assigned</button>
                </div>
              </div>
            </div>

            <PermissionEditor
              key={effectiveSelected}
              role={activeRole}
              grouped={filteredGrouped}
              allPermissions={permissions}
              mutation={mutation}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

// Define PermissionEditor; its parameters and body implement this operation.
function PermissionEditor({ role, grouped, allPermissions, mutation }) {
  // Declare [checked, setChecked] for use by the surrounding module or function.
  const [checked, setChecked] = useState(() => new Set((role?.permissions || []).map(permissionId).filter(Boolean)));

  // Declare visibleIds for use by the surrounding module or function.
  const visibleIds = Object.values(grouped).flat().map(permissionId).filter(Boolean);
  // Declare allIds for use by the surrounding module or function.
  const allIds = allPermissions.map(permissionId).filter(Boolean);
  // Declare isSuperAdmin for use by the surrounding module or function.
  const isSuperAdmin = ["super_admin", "superadmin"].includes(roleKey(role));

  // Declare toggle for use by the surrounding module or function.
  const toggle = (id) => setChecked((previous) => {
    // Declare next for use by the surrounding module or function.
    const next = new Set(previous);
    // Check the condition (next.has(id)) and run the matching branch.
    if (next.has(id)) next.delete(id); else next.add(id);
    // Return the value of next to the caller.
    return next;
  });

  // Declare setVisible for use by the surrounding module or function.
  const setVisible = (value) => setChecked((previous) => {
    // Declare next for use by the surrounding module or function.
    const next = new Set(previous);
    // Perform the side effect or state update expressed on the following line.
    visibleIds.forEach((id) => value ? next.add(id) : next.delete(id));
    // Return the value of next to the caller.
    return next;
  });

  // Declare save for use by the surrounding module or function.
  const save = () => {
    // Check the condition (!roleId(role)) and run the matching branch.
    if (!roleId(role)) return;
    // Check the condition (isSuperAdmin && checked.size === 0) and run the matching branch.
    if (isSuperAdmin && checked.size === 0) {
      // Perform the side effect or state update expressed on the following line.
      toast.error("Super Admin cannot be saved with zero permissions.");
      // Return the result to the caller.
      return;
    }
    // Perform the side effect or state update expressed on the following line.
    mutation.mutate({ id: roleId(role), permissions: [...checked] });
  };

  // Return the expression shown below to the caller.
  return (
    <div className="p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <CircleAlert className="mt-0.5 shrink-0 text-amber-600" size={19} />
          <div>
            <p className="text-sm font-bold text-amber-900">Access changes are powerful</p>
            <p className="mt-0.5 text-xs leading-5 text-amber-800">Use least privilege. Removing a permission can immediately restrict the role from the corresponding admin operation.</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">{checked.size} selected</span>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setVisible(true)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Select visible</button>
        <button type="button" onClick={() => setVisible(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear visible</button>
        <button type="button" onClick={() => setChecked(new Set(allIds))} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">Select all</button>
        <button type="button" onClick={() => setChecked(new Set())} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Clear all</button>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Assigned
          <span className="ml-2 h-2 w-2 rounded-full bg-slate-300" /> Not assigned
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <Search className="mx-auto text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">No matching permissions</p>
          <p className="mt-1 text-sm text-slate-500">Try another search term or module filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([module, items]) => {
            const moduleIds = items.map(permissionId).filter(Boolean);
            const selectedCount = moduleIds.filter((id) => checked.has(id)).length;
            return (
              <section key={module} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">{module}</h3>
                    <p className="text-xs text-slate-500">{selectedCount} of {moduleIds.length} assigned</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setChecked((previous) => new Set([...previous, ...moduleIds]))} className="text-xs font-semibold text-emerald-700 hover:underline">Select module</button>
                    <button type="button" onClick={() => setChecked((previous) => { const next = new Set(previous); moduleIds.forEach((id) => next.delete(id)); return next; })} className="text-xs font-semibold text-slate-500 hover:underline">Clear</button>
                  </div>
                </div>
                <div className="grid gap-2 p-3 md:grid-cols-2">
                  {items.map((permission) => {
                    const id = permissionId(permission);
                    const assigned = checked.has(id);
                    return (
                      <label key={id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${assigned ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                        <input type="checkbox" checked={assigned} onChange={() => toggle(id)} className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2 font-semibold text-slate-800">
                            {permissionLabel(permission)}
                            {assigned ? <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">Assigned</span> : null}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">{permissionDescription(permission)}</span>
                          {(permission?.key || permission?.name) ? <code className="mt-1 block break-all text-[10px] text-slate-400">{permission.key || permission.name}</code> : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="sticky bottom-4 z-10 mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          <span className="font-bold text-slate-900">{checked.size}</span> permissions selected for <span className="font-semibold text-slate-900">{prettyName(role)}</span>.
        </div>
        <button type="button" onClick={save} disabled={mutation.isPending || (isSuperAdmin && checked.size === 0)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
          <Save size={17} />
          {mutation.isPending ? "Saving changes..." : "Save permissions"}
        </button>
      </div>
    </div>
  );
}

// Define Stat; its parameters and body implement this operation.
function Stat({ label, value, icon: Icon }) {
  // Return the expression shown below to the caller.
  return (
    <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
      <Icon size={17} className="mb-2 text-emerald-200" />
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[11px] font-medium text-slate-300">{label}</div>
    </div>
  );
}

// Define LoadingState; its parameters and body implement this operation.
function LoadingState() {
  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-48 rounded-3xl bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]"><div className="h-[620px] rounded-2xl bg-slate-200" /><div className="h-[620px] rounded-2xl bg-slate-200" /></div>
      </div>
    </div>
  );
}

// Define EmptyState; its parameters and body implement this operation.
function EmptyState({ title, description }) {
  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <ShieldCheck className="mx-auto text-slate-300" size={42} />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
