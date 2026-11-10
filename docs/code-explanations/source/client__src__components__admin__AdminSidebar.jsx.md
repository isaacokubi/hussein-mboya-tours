# Source explanation: client/src/components/admin/AdminSidebar.jsx

**Source:** [client/src/components/admin/AdminSidebar.jsx](../../../client/src/components/admin/AdminSidebar.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `NavLink` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `LayoutDashboard`, `Map`, `CalendarCheck`, `Wallet`, `Users`, `Car`, `Settings`, `Smartphone`, `FileText`, `Home`, `Shield`, `BarChart3`, `UserRoundCog`, `PackageCheck`, `Receipt`, `BookOpen`, `Code2`, `Hotel`, `Plane`, `BrainCircuit` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `isAdmin` from `../../utils/roleUtils`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/roleUtils](../../../client/src/utils/roleUtils.js)

## Runtime declarations and data flow

### `AdminSidebar` — lines 15–81

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 16:** `const { user, hasPermission } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const { settings = {} } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const companyName = settings?.companyName || "Company";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const adminUser = isAdmin(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const canRender = (permission) => !permission || (adminUser && ADMIN_CORE_PERMISSIONS.has(permission)) || hasPermission(permission);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `canRender` — lines 20–20

Parameters: `permission`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const sections = [`.
- Line 13: `const ADMIN_CORE_PERMISSIONS = new Set(["admin.dashboard","booking.manage","tour.manage","customer.view","staff.manage","agent.manage","finance.view","analytics.view","roles.manage`.
- Line 16: `const { user, hasPermission } = useAuth();`.
- Line 17: `const { settings = {} } = useSettings() || {};`.
- Line 18: `const companyName = settings?.companyName || "Company";`.
- Line 19: `const adminUser = isAdmin(user);`.
- Line 20: `const canRender = (permission) => !permission || (adminUser && ADMIN_CORE_PERMISSIONS.has(permission)) || hasPermission(permission);`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
