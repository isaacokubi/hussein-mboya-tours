# Source explanation: client/src/components/layout/Navbar.jsx

**Source:** [client/src/components/layout/Navbar.jsx](../../../client/src/components/layout/Navbar.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link`, `NavLink`, `useNavigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Menu`, `X`, `User`, `LogOut`, `LayoutDashboard`, `Plane`, `Heart`, `ChevronDown`, `Search` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `PUBLIC_BRAND_NAME`, `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `useTenant` from `../../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)

## Runtime declarations and data flow

### `normalizeRole` — lines 7–7

Parameters: `user`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `initialsFor` — lines 8–8

Parameters: `name`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `Navbar` — lines 9–9

Parameters: none.
React hooks used: useState, useMemo.

Key statements:
- **Line 9:** `function Navbar(){const {user,logout}=useAuth();const {settings={}}=useSettings()||{};const {tenant={}}=useTenant()||{};const navigate=useNavigate();const [mobileOpen,setMobileOpen]=useState(false);const [profileOpen,set` — Uses a React hook to manage component state, side effects, memoization, or server state.

### `closeMobile` — lines 9–9

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `submitSearch` — lines 9–9

Parameters: `event`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const normalizeRole=(user)=>{if(!user)return "";if(typeof user.role==="string")return user.role.toLowerCase().replace(/[\s-]/g,"_");if(user.role?.name)return String(user.role.name)`.
- Line 8: `const initialsFor=(name)=>{const words=String(name||"Company").trim().split(/\s+/).filter(Boolean);if(!words.length)return "CO";if(words.length===1)return words[0].slice(0,2).toUpp`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
