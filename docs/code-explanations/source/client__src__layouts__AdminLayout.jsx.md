# Source explanation: client/src/layouts/AdminLayout.jsx

**Source:** [client/src/layouts/AdminLayout.jsx](../../../client/src/layouts/AdminLayout.jsx)

## Purpose

A first-party runtime module; use its import/export and caller map below to determine the specific role.

## Imports and dependencies

-  from `../styles/admin-settings.css`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/styles/admin-settings.css](../../../client/src/styles/admin-settings.css)
-  from `../styles/admin-dashboard.css`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/styles/admin-dashboard.css](../../../client/src/styles/admin-dashboard.css)
- `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `NavLink`, `Outlet`, `useLocation` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Activity`, `BarChart3`, `Bell`, `Bot`, `Car`, `CalendarCheck`, `CreditCard`, `FileBarChart`, `FileText`, `Handshake`, `Image`, `LayoutDashboard`, `Menu`, `PackageCheck`, `Plane`, `BriefcaseBusiness`, `BadgeDollarSign`, `Receipt`, `Settings`, `Shield`, `Smartphone`, `Star`, `Tag`, `UserCog`, `Users`, `Wallet`, `X`, `Code2`, `Hotel`, `Home` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `useSettings` from `../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `api` from `../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)
- `getUserRole` from `../utils/roleUtils`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/roleUtils](../../../client/src/utils/roleUtils.js)
- `DashboardLogoutButton` from `../components/common/DashboardLogoutButton`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/common/DashboardLogoutButton](../../../client/src/components/common/DashboardLogoutButton.jsx)

## Runtime declarations and data flow

### `AdminLayout` — lines 62–127

Parameters: none.
HTTP operations detected: api.get; response/error handling occurs in this function and its caller. React hooks used: useState, useEffect, useMemo. Error control: try=false, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 63:** `const { user, hasPermission } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `const { companyName } = useSettings();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const [mobileOpen, setMobileOpen] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 66:** `const [planFeatures, setPlanFeatures] = useState([]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 67:** `const [plan, setPlan] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 68:** `const location = useLocation();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `const role = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `const isAdministrator = ["admin", "administrator", "super_admin"].includes(String(role || "").toLowerCase());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `useEffect(() => setMobileOpen(false), [location.pathname]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 74:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 75:** `if (!isAdministrator) return undefined;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** `let active = true;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `api.get("/subscription").then(({ data }) => {` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 78:** `if (!active) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 82:** `return () => { active = false; };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 85:** `const links = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 86:** `const permissionLinks = MENU.filter(([, , , permission]) => hasPermission(permission));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `return permissionLinks.filter(([, , , , feature]) => !feature || planFeatures.includes(feature));` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `SidebarContent` — lines 129–162

Parameters: `{companyName, user, groups, plan}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 130:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 12: `const MENU = [`.
- Line 56: `const GROUPS = [`.
- Line 63: `const { user, hasPermission } = useAuth();`.
- Line 64: `const { companyName } = useSettings();`.
- Line 65: `const [mobileOpen, setMobileOpen] = useState(false);`.
- Line 66: `const [planFeatures, setPlanFeatures] = useState([]);`.
- Line 67: `const [plan, setPlan] = useState("");`.
- Line 68: `const location = useLocation();`.
- Line 69: `const role = getUserRole(user);`.
- Line 70: `const isAdministrator = ["admin", "administrator", "super_admin"].includes(String(role || "").toLowerCase());`.
- Line 76: `let active = true;`.
- Line 85: `const links = useMemo(() => {`.
- Line 86: `const permissionLinks = MENU.filter(([, , , permission]) => hasPermission(permission));`.
- Line 90: `const groupedLinks = useMemo(() => {`.
- Line 91: `const byName = new Map(links.map(link => [link[0], link]));`.
- Line 129: `function SidebarContent({ companyName, user, groups, plan }) {`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
