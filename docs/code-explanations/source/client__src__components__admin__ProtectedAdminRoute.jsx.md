# Source explanation: client/src/components/admin/ProtectedAdminRoute.jsx

**Source:** [client/src/components/admin/ProtectedAdminRoute.jsx](../../../client/src/components/admin/ProtectedAdminRoute.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `Navigate`, `Outlet` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `getUserRole` from `../../utils/roleUtils`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/roleUtils](../../../client/src/utils/roleUtils.js)

## Runtime declarations and data flow

### `ProtectedAdminRoute` — lines 5–20

Parameters: `{permission}`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `const { user, loading, hasPermission } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 9:** `if (!user) return <Navigate to="/admin/login" replace />;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `const roleName = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const allowedRoles = ["admin", "super_admin"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (!allowedRoles.includes(roleName)) return <Navigate to="/admin/login" replace />;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (permission && !hasPermission(permission)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `return <Navigate to="/admin/unauthorized" replace />;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 19:** `return <Outlet />;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const { user, loading, hasPermission } = useAuth();`.
- Line 11: `const roleName = getUserRole(user);`.
- Line 12: `const allowedRoles = ["admin", "super_admin"];`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
