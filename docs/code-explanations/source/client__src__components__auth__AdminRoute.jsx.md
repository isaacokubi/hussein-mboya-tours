# Source explanation: client/src/components/auth/AdminRoute.jsx

**Source:** [client/src/components/auth/AdminRoute.jsx](../../../client/src/components/auth/AdminRoute.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `Navigate`, `Outlet`, `useLocation` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `getUserRole`, `isAdmin` from `../../utils/roleUtils`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/roleUtils](../../../client/src/utils/roleUtils.js)

## Runtime declarations and data flow

### `AdminRoute` — lines 8–27

Parameters: `{children, permission}`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const location = useLocation();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const role = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const isPlatformOwner = PLATFORM_ROLES.has(String(role || "").trim().toLowerCase());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const isManagerContentRoute = role === "manager" && MANAGER_CONTENT_PATHS.some((path) => location.pathname === path || location.pathname.startsWith(\`${path}/\`));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `if (isPlatformOwner) return <Navigate to="/superadmin/dashboard" replace />;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `if (!isAdmin(user) && !isManagerContentRoute) return <Navigate to="/" replace />;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if (permission && !hasPermission(permission)) return <Navigate to="/admin/unauthorized" replace />;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `return children || <Outlet />;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const MANAGER_CONTENT_PATHS = ["/admin/gallery"];`.
- Line 6: `const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);`.
- Line 9: `<sensitive declaration redacted>`.
- Line 10: `const location = useLocation();`.
- Line 11: `const role = getUserRole(user);`.
- Line 12: `const isPlatformOwner = PLATFORM_ROLES.has(String(role || "").trim().toLowerCase());`.
- Line 13: `const isManagerContentRoute = role === "manager" && MANAGER_CONTENT_PATHS.some((path) => location.pathname === path || location.pathname.startsWith(\`${path}/\`));`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
