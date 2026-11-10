# Source explanation: client/src/layouts/TourManagerLayout.jsx

**Source:** [client/src/layouts/TourManagerLayout.jsx](../../../client/src/layouts/TourManagerLayout.jsx)

## Purpose

A first-party runtime module; use its import/export and caller map below to determine the specific role.

## Imports and dependencies

- `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Menu`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Navigate`, `Outlet`, `useLocation` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `TourManagerSidebar` from `../components/tourManager/TourManagerSidebar`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/tourManager/TourManagerSidebar](../../../client/src/components/tourManager/TourManagerSidebar.jsx)
- `DashboardLogoutButton` from `../components/common/DashboardLogoutButton`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/common/DashboardLogoutButton](../../../client/src/components/common/DashboardLogoutButton.jsx)
- `useAuth` from `../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `getUserRole` from `../utils/roleUtils`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/roleUtils](../../../client/src/utils/roleUtils.js)

## Runtime declarations and data flow

### `TourManagerLayout` — lines 9–32

Parameters: none.
React hooks used: useState, useEffect. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `const [mobileOpen, setMobileOpen] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 11:** `const location = useLocation();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const { user } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const role = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `useEffect(() => { const timer = setTimeout(() => setMobileOpen(false), 0); return () => clearTimeout(timer); }, [location]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `if (role === "admin" || role === "super_admin") return <Navigate to="/admin/dashboard" replace />;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 9: `const TourManagerLayout = () => {`.
- Line 10: `const [mobileOpen, setMobileOpen] = useState(false);`.
- Line 11: `const location = useLocation();`.
- Line 12: `const { user } = useAuth();`.
- Line 13: `const role = getUserRole(user);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
