# Source explanation: client/src/components/auth/ProtectedRoute.jsx

**Source:** [client/src/components/auth/ProtectedRoute.jsx](../../../client/src/components/auth/ProtectedRoute.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `Navigate`, `useLocation` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `dashboardPath`, `getUserRole`, `normalizeRole` from `../../utils/roleUtils`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/roleUtils](../../../client/src/utils/roleUtils.js)

## Runtime declarations and data flow

### `roleAllowed` — lines 10–22

Parameters: `userRole`, `allowedRoles`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `if (!allowedRoles.length) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `const managerRoute = allowedRoles.includes("tour_manager");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `if (managerRoute && userRole !== "tour_manager") return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (allowedRoles.includes(userRole)) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `const inheritedRoles = ROLE_PARENTS[userRole];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if (inheritedRoles && allowedRoles.some((role) => inheritedRoles.has(role))) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `return false;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ProtectedRoute` — lines 24–52

Parameters: `{children, roles, permission}`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const location = useLocation();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const isMyBookingsRoute = location.pathname === "/my-bookings";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (loading) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 37:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `if (isMyBookingsRoute) return children;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `const userRole = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const allowedRoles = roles.map(normalizeRole);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `if (!roleAllowed(userRole, allowedRoles)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `return <Navigate to={dashboardPath(user)} replace />;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 47:** `if (permission && !hasPermission(permission)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `return <Navigate to="/unauthorized" replace />;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 51:** `return children;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const ROLE_PARENTS = {`.
- Line 10: `function roleAllowed(userRole, allowedRoles) {`.
- Line 13: `const managerRoute = allowedRoles.includes("tour_manager");`.
- Line 18: `const inheritedRoles = ROLE_PARENTS[userRole];`.
- Line 25: `<sensitive declaration redacted>`.
- Line 26: `const location = useLocation();`.
- Line 27: `const isMyBookingsRoute = location.pathname === "/my-bookings";`.
- Line 40: `const userRole = getUserRole(user);`.
- Line 41: `const allowedRoles = roles.map(normalizeRole);`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
