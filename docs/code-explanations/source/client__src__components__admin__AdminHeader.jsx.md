# Source explanation: client/src/components/admin/AdminHeader.jsx

**Source:** [client/src/components/admin/AdminHeader.jsx](../../../client/src/components/admin/AdminHeader.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useNavigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Menu`, `Bell`, `LogOut` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)

## Runtime declarations and data flow

### `AdminHeader` — lines 5–14

Parameters: `{onMenu}`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 6:** `const navigate=useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `const {user, logout}=useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `const handleLogout=async()=>{await logout(); navigate("/admin/login");};` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 9:** `const name=user?.name || user?.email || "Administrator";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `return <header className="ops-header">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `handleLogout` — lines 8–8

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:

## Module-level declarations

- Line 6: `const navigate=useNavigate();`.
- Line 7: `const {user, logout}=useAuth();`.
- Line 8: `const handleLogout=async()=>{await logout(); navigate("/admin/login");};`.
- Line 9: `const name=user?.name || user?.email || "Administrator";`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
