import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roleUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSuperAdminRoles,
  getSuperAdminRole,
  getSuperAdminPermissions,
  updateSuperAdminRolePermissions,
} from "../../api/superadmin/superAdminRoleApi";

const normalizeRoleName = (role) =>
  String(role?.name || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const permissionId = (permission) =>
  typeof permission === "object"
    ? String(permission?._id || "")
    : String(permission || "");

export default function SuperAdminRoles() {
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loadError, setLoadError] = useState("");

  const currentRole = normalizeRoleName({ name: getUserRole(user) });
  const isSuperAdmin = currentRole === "superadmin";
  const canManageRoles = isSuperAdmin || hasPermission("roles.manage");

  const rolesQuery = useQuery({
    queryKey: ["superadmin-rbac-roles"],
    queryFn: getSuperAdminRoles,
  });

  const permissionsQuery = useQuery({
    queryKey: ["superadmin-rbac-permissions"],
    queryFn: getSuperAdminPermissions,
  });

  const roles = Array.isArray(rolesQuery.data) ? rolesQuery.data : [];
  const permissions = Array.isArray(permissionsQuery.data)
    ? permissionsQuery.data
    : [];

  const updateRole = useMutation({
    mutationFn: () =>
      updateSuperAdminRolePermissions(selectedRole._id, selectedPermissions),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["superadmin-rbac-roles"],
      });
      try {
        const refreshed = await getSuperAdminRole(selectedRole._id);
        setSelectedRole(refreshed);
        setSelectedPermissions((refreshed.permissions || []).map(permissionId));
        setLoadError("");
      } catch (error) {
        setLoadError(
          error?.response?.data?.message ||
            "Permissions were saved, but the role could not be refreshed.",
        );
      }
    },
    onError: (error) => {
      setLoadError(
        error?.response?.data?.message || "Unable to update permissions.",
      );
    },
  });

  if (!canManageRoles) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="text-lg font-bold">Access denied</h2>
          <p className="mt-1">You do not have permission to manage roles.</p>
        </div>
      </div>
    );
  }

  const openRole = async (role) => {
    setLoadError("");
    try {
      const fullRole = await getSuperAdminRole(role._id);
      setSelectedRole(fullRole);
      setSelectedPermissions((fullRole.permissions || []).map(permissionId));
    } catch (error) {
      setLoadError(
        error?.response?.data?.message || "Unable to load role details.",
      );
    }
  };

  const selectedIsSuperAdmin = normalizeRoleName(selectedRole) === "superadmin";

  const togglePermission = (id) => {
    if (selectedIsSuperAdmin) return;
    const normalizedId = String(id);
    setSelectedPermissions((previous) =>
      previous.includes(normalizedId)
        ? previous.filter((permission) => permission !== normalizedId)
        : [...previous, normalizedId],
    );
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Access Control
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Roles &amp; Permissions Center
            </h1>
            <p className="mt-1 text-slate-500">
              Manage platform-wide access policies for every operational role.
            </p>
          </div>
          <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600">
            {roles.length} role{roles.length === 1 ? "" : "s"}
          </div>
        </div>
      </header>

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {loadError}
        </div>
      )}

      {rolesQuery.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Unable to load platform roles. Check authentication and the
          <code className="mx-1">/superadmin/roles</code> API.
        </div>
      )}

      {permissionsQuery.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Unable to load the platform permission catalogue.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Roles</h2>
            {rolesQuery.isLoading && (
              <span className="text-sm text-slate-500">Loading...</span>
            )}
          </div>

          {rolesQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-slate-500">
              No platform roles found.
            </div>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => {
                const roleName = normalizeRoleName(role);
                const protectedRole = roleName === "superadmin";

                return (
                  <button
                    key={role._id}
                    type="button"
                    onClick={() => openRole(role)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedRole?._id === role._id
                        ? "border-slate-900 bg-slate-50 shadow-sm"
                        : "hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {role.displayName || role.name}
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                          {role.name}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          protectedRole
                            ? "bg-red-100 text-red-700"
                            : role.isSystem
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {protectedRole
                          ? "Protected"
                          : role.isSystem
                            ? "System"
                            : "Custom"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>Level {role.level ?? "-"}</span>
                      <span>{role.permissions?.length || 0} permissions</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          {!selectedRole ? (
            <div className="flex min-h-[400px] items-center justify-center text-center text-slate-500">
              <div>
                <h2 className="text-xl font-semibold text-slate-700">
                  Select a role
                </h2>
                <p className="mt-2">
                  Choose a role from the left to inspect its permissions.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 border-b pb-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Role</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      {selectedRole.displayName || selectedRole.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedRole.description || "No role description provided."}
                    </p>
                  </div>
                  {selectedIsSuperAdmin && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                      Super Admin Protected
                    </span>
                  )}
                </div>
              </div>

              {permissionsQuery.isLoading ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                      key={item}
                      className="h-14 animate-pulse rounded-lg bg-slate-100"
                    />
                  ))}
                </div>
              ) : permissions.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-slate-500">
                  No active permissions are configured.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {permissions.map((permission) => {
                    const id = permissionId(permission);
                    const checked = selectedPermissions.includes(id);

                    return (
                      <label
                        key={id}
                        className={`flex items-start gap-3 rounded-lg border p-4 transition ${
                          selectedIsSuperAdmin
                            ? "cursor-not-allowed bg-slate-50 opacity-60"
                            : checked
                              ? "cursor-pointer border-emerald-300 bg-emerald-50"
                              : "cursor-pointer hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4"
                          checked={checked}
                          disabled={selectedIsSuperAdmin}
                          onChange={() => togglePermission(id)}
                        />
                        <span>
                          <span className="block font-medium text-slate-900">
                            {permission.label || permission.name}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">
                            {permission.name}
                          </span>
                          {permission.description && (
                            <span className="mt-1 block text-xs text-slate-400">
                              {permission.description}
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                <div className="text-sm text-slate-500">
                  {selectedIsSuperAdmin
                    ? "Super Admin permissions are protected to prevent accidental lockout."
                    : `${selectedPermissions.length} permission${
                        selectedPermissions.length === 1 ? "" : "s"
                      } selected`}
                </div>
                <button
                  type="button"
                  onClick={() => updateRole.mutate()}
                  disabled={
                    selectedIsSuperAdmin ||
                    updateRole.isPending ||
                    permissionsQuery.isLoading
                  }
                  className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateRole.isPending ? "Saving..." : "Save Permissions"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
