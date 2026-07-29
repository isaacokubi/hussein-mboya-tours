import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({
  children,

  roles = [],
}) {
  const {
    user,

    loading,
  } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        text-lg
        font-semibold
        "
      >
        Loading...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK LOGIN
  |--------------------------------------------------------------------------
  */

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /*
  |--------------------------------------------------------------------------
  | EXTRACT USER ROLE
  |--------------------------------------------------------------------------
  */

  let userRole = "";

  if (typeof user.role === "string") {
    userRole = user.role;
  } else if (user.role?.name) {
    userRole = user.role.name;
  } else if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    userRole = user.roles[0]?.name || "";
  }

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE ROLE FORMAT
  |
  |--------------------------------------------------------------------------
  */

  const normalizeRole = (role) => {
    return role

      ?.toString()

      .toLowerCase()

      .replace(/[\s_-]/g, "");
  };

  const normalizedUserRole = normalizeRole(userRole);

  /*
  |--------------------------------------------------------------------------
  | ROLE ALIASES
  |--------------------------------------------------------------------------
  */

  const roleAliases = {
    guide: "guide",

    guide: "guide",

    manager: "manager",

    admin: "admin",

    agent: "agent",
  };

  const finalUserRole = roleAliases[userRole] || normalizedUserRole;

  /*
  |--------------------------------------------------------------------------
  | DEBUG
  |--------------------------------------------------------------------------
  */

  console.log("Logged User:", user);

  console.log("Detected Role:", finalUserRole);

  /*
  |--------------------------------------------------------------------------
  | ROLE PROTECTION
  |--------------------------------------------------------------------------
  */

  if (roles.length > 0) {
    const allowedRoles = roles.map(
      (role) => roleAliases[role] || normalizeRole(role),
    );

    const hasPermission = allowedRoles.includes(finalUserRole);

    if (!hasPermission) {
      console.log("Blocked Route", {
        requiredRoles: allowedRoles,
        userRole: finalUserRole,
      });

      /*
      |--------------------------------------------------------------------------
      | SMART REDIRECT
      |--------------------------------------------------------------------------
      */

      switch (finalUserRole) {
        case "manager":
          return <Navigate to="/manager/dashboard" replace />;

        case "guide":
          return <Navigate to="/guide/dashboard" replace />;

        case "admin":
          return <Navigate to="/admin" replace />;

        case "agent":
          return <Navigate to="/agent" replace />;

        default:
          return <Navigate to="/dashboard" replace />;
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | AUTHORIZED
  |--------------------------------------------------------------------------
  */

  return children;
}
