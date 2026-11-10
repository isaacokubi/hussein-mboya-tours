# Source explanation: client/src/pages/admin/DestinationManagement.jsx

**Source:** [client/src/pages/admin/DestinationManagement.jsx](../../../client/src/pages/admin/DestinationManagement.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useNavigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `MapPin`, `Plus`, `Search`, `RefreshCw`, `Eye`, `Pencil`, `Star`, `CheckCircle2`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAdminDestinations` from `../../api/adminDestinationApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminDestinationApi](../../../client/src/api/adminDestinationApi.js)

## Runtime declarations and data flow

### `DestinationManagement` — lines 8–204

Parameters: none.
React hooks used: useState, useQuery, useMemo. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 11:** `const [statusFilter, setStatusFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 12:** `const [featuredFilter, setFeaturedFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `} = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const filteredDestinations = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const term = search.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `return destinations.filter((destination) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `const matchesSearch = !term || [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const status = String(destination.status || "active").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const matchesStatus = statusFilter === "all" || status === statusFilter;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const matchesFeatured = featuredFilter === "all"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `return matchesSearch && matchesStatus && matchesFeatured;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 45:** `const activeCount = destinations.filter((d) => String(d.status || "active").toLowerCase() === "active").length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const featuredCount = destinations.filter((d) => Boolean(d.featured)).length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const inactiveCount = destinations.length - activeCount;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const getImageUrl = (destination) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getImageUrl` — lines 49–55

Parameters: `destination`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 50:** `const image = destination.images?.[0]?.url || destination.images?.[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `if (!image) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `return image.startsWith("http")` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `const DestinationManagement = () => {`.
- Line 9: `const navigate = useNavigate();`.
- Line 10: `const [search, setSearch] = useState("");`.
- Line 11: `const [statusFilter, setStatusFilter] = useState("all");`.
- Line 12: `const [featuredFilter, setFeaturedFilter] = useState("all");`.
- Line 14: `const {`.
- Line 25: `const filteredDestinations = useMemo(() => {`.
- Line 26: `const term = search.trim().toLowerCase();`.
- Line 29: `const matchesSearch = !term || [`.
- Line 35: `const status = String(destination.status || "active").toLowerCase();`.
- Line 36: `const matchesStatus = statusFilter === "all" || status === statusFilter;`.
- Line 37: `const matchesFeatured = featuredFilter === "all"`.
- Line 45: `const activeCount = destinations.filter((d) => String(d.status || "active").toLowerCase() === "active").length;`.
- Line 46: `const featuredCount = destinations.filter((d) => Boolean(d.featured)).length;`.
- Line 47: `const inactiveCount = destinations.length - activeCount;`.
- Line 49: `const getImageUrl = (destination) => {`.
- Line 50: `const image = destination.images?.[0]?.url || destination.images?.[0];`.
- Line 157: `const status = String(destination.status || "active").toLowerCase();`.
- Line 158: `const imageUrl = getImageUrl(destination);`.

## Security, errors and performance checkpoints

- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
