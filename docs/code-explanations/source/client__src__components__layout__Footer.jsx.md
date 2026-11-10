# Source explanation: client/src/components/layout/Footer.jsx

**Source:** [client/src/components/layout/Footer.jsx](../../../client/src/components/layout/Footer.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `PUBLIC_BRAND_NAME`, `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `useTenant` from `../../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)
- `FaFacebookF`, `FaInstagram`, `FaXTwitter`, `FaYoutube`, `FaPhone`, `FaLocationDot`, `FaEnvelope` from `react-icons/fa6`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ShieldCheck`, `ArrowUpRight` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `Footer` — lines 8–46

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 9:** `const { user } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const { settings = {} } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const { tenant = {} } = useTenant() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const companyName = !user ? PUBLIC_BRAND_NAME : (settings.companyName || tenant.name || tenant.companyName || "Company");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const supportEmail = settings.supportEmail || tenant.contactEmail || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const supportPhone = settings.supportPhone || tenant.contactPhone || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const year = new Date().getFullYear();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const userRole = typeof user?.role === "string" ? user.role.toLowerCase() : user?.role?.name?.toLowerCase() || user?.roles?.[0]?.name?.toLowerCase() || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const socialLinks = [["Facebook", settings.facebook, FaFacebookF], ["Instagram", settings.instagram, FaInstagram], ["X", settings.twitter, FaXTwitter], ["YouTube", settings.youtube, FaYoutube]].filter(([, href]) => href)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const popularDestinations = [["Maasai Mara", "/destinations/maasai-mara"], ["Diani Beach", "/destinations/diani-beach"], ["Mount Kenya", "/destinations/mount-kenya"], ["Nairobi", "/destinations/nairobi"]];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 9: `const { user } = useAuth();`.
- Line 10: `const { settings = {} } = useSettings() || {};`.
- Line 11: `const { tenant = {} } = useTenant() || {};`.
- Line 12: `const companyName = !user ? PUBLIC_BRAND_NAME : (settings.companyName || tenant.name || tenant.companyName || "Company");`.
- Line 13: `const supportEmail = settings.supportEmail || tenant.contactEmail || "";`.
- Line 14: `const supportPhone = settings.supportPhone || tenant.contactPhone || "";`.
- Line 15: `const year = new Date().getFullYear();`.
- Line 16: `const userRole = typeof user?.role === "string" ? user.role.toLowerCase() : user?.role?.name?.toLowerCase() || user?.roles?.[0]?.name?.toLowerCase() || "";`.
- Line 17: `const socialLinks = [["Facebook", settings.facebook, FaFacebookF], ["Instagram", settings.instagram, FaInstagram], ["X", settings.twitter, FaXTwitter], ["YouTube", settings.youtube`.
- Line 18: `const popularDestinations = [["Maasai Mara", "/destinations/maasai-mara"], ["Diani Beach", "/destinations/diani-beach"], ["Mount Kenya", "/destinations/mount-kenya"], ["Nairobi", "`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
