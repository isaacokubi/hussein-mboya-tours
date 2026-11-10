# Source explanation: client/src/pages/About.jsx

**Source:** [client/src/pages/About.jsx](../../../client/src/pages/About.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useTenant` from `../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)
- `useSettings` from `../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `Globe2`, `HeartHandshake`, `MapPin`, `ShieldCheck`, `Users`, `Compass`, `Plane`, `Star` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `motion` from `framer-motion`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `About` — lines 12–44

Parameters: none.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `const { tenant } = useTenant();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const { settings } = useSettings();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const companyName = settings?.companyName || tenant?.name || "Hussein Mboya Tours";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const values = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const destinations = ["Maasai Mara Wildlife Safari", "Amboseli National Park", "Diani Beach Holidays", "Mount Kenya Adventures", "Cultural Heritage Tours", "Luxury African Safaris"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `return <div className="min-w-0 overflow-x-clip bg-white">` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const ABOUT_IMAGES = {`.
- Line 13: `const { tenant } = useTenant();`.
- Line 14: `const { settings } = useSettings();`.
- Line 15: `const companyName = settings?.companyName || tenant?.name || "Hussein Mboya Tours";`.
- Line 16: `const values = [`.
- Line 22: `const destinations = ["Maasai Mara Wildlife Safari", "Amboseli National Park", "Diani Beach Holidays", "Mount Kenya Adventures", "Cultural Heritage Tours", "Luxury African Safaris"`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
