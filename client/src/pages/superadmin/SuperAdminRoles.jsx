import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoles, getRole, getPermissions, updateRolePermissions } from "../../api/superAdminApi";

const roleKey = (role) => String(role?.name || "").trim().toLowerCase().replace(/[\s_-]+/g, "");

export default function SuperAdminRoles() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loadError, setLoadError] = useState("");

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  });

  const updateRole = useMutation({
    mutationFn: () => updateRolePermissions(selectedRole._id, selectedPermissions),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      const refreshed = await getRole(selectedRole._id);
      setSelectedRole(refreshed);
      setSelectedPermissions((refreshed.permissions || []).map((p) => p?._id || p));
      setLoadError("");
    },
    onError: (error) => {
      setLoadError(error?.response?.data?.message || "Unable to update permissions.");
    },
  });

  if (!hasPermission("roles.manage")) {
    return <div className="p-8 text-red-600">You do not have permission to manage roles.</div>;
  }

  const openRole = async (role) => {
    setLoadError("");
    try {
      const fullRole = await getRole(role._id);
      setSelectedRole(fullRole);
      setSelectedPermissions((fullRole.permissions || []).map((p) => p?._id || p));
    } catch (error) {
      setLoadError(error?.response?.data?.message || "Unable to load role details.");
    }
  };

  const selectedIsSystem = Boolean(selectedRole?.isSystem);
  const selectedIsSuperAdmin = roleKey(selectedRole) === "superadmin";

  const togglePermission = (id) => {
    if (selectedIsSystem) return;
    setSelectedPermissions((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6 p-8">
      <header>
        <h1 className="text-3xl font-bold">Roles &amp; Permissions Center</h1>
        <p className="mt-1 text-gray-600">Select a role to inspect its permissions. System roles are protected from accidental changes.</p>
      </header>

      {loadError && <div className="rounded-lg bg-red-50 p-4 text-red-700">{loadError}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">System Roles</h2>
          {rolesLoading ? <p>Loading roles...</p> : roles.length === 0 ? <p className="text-gray-500">No roles found.</p> : roles.map((role) => {
            const system = Boolean(role.isSystem);
            return (
              <button key={role._id} type="button" onClick={() => openRole(role)} className="mb-3 w-full rounded-lg border p-4 text-left hover:bg-gray-50">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold">{role.displayName || role.name}</h3>
                  {system && <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">System</span>}
                </div>
                <p className="text-sm text-gray-600">Level: {role.level ?? "-"}</p>
                <p className="text-sm text-gray-600">Permissions: {role.permissions?.length || 0}</p>
              </button>
            );
          })}
        </section>

        <section className="rounded-xl border bg-white p-6 lg:col-span-2">
          {!selectedRole ? (
            <div className="py-10 text-center text-gray-500">Select a role to inspect its permissions.</div>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{selectedRole.displayName || selectedRole.name}</h2>
                  <p className="text-sm text-gray-500">{selectedIsSystem ? "Protected system role" : "Custom role"}</p>
                </div>
                {selectedIsSuperAdmin && <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">SuperAdmin protected</span>}
              </div>

              {permissionsLoading ? <p>Loading permissions...</p> : (
                <div className="grid gap-3 md:grid-cols-2">
                  {permissions.map((permission) => (
                    <label key={permission._id} className={`flex gap-3 rounded border p-3 ${selectedIsSystem ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-50"}`}>
                      <input type="checkbox" checked={selectedPermissions.includes(permission._id)} disabled={selectedIsSystem} onChange={() => togglePermission(permission._id)} />
                      <span>{permission.label || permission.name}</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => updateRole.mutate()} disabled={selectedIsSystem || updateRole.isPending || permissionsLoading} className="rounded bg-black px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {updateRole.isPending ? "Saving..." : "Save Permissions"}
                </button>
                {selectedIsSystem && <span className="text-sm text-gray-500">System roles cannot have their permissions changed here.</span>}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
