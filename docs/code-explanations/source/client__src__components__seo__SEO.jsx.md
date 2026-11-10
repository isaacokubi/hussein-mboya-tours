# Source explanation: client/src/components/seo/SEO.jsx

**Source:** [client/src/components/seo/SEO.jsx](../../../client/src/components/seo/SEO.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `Helmet` from `react-helmet-async`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `SEO` — lines 7–45

Parameters: `{title, description, keywords, image, url, type, noIndex}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 16:** `const { settings = {} } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const siteName = settings.companyName || "Company";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const resolvedTitle = title || siteName;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const pageTitle = resolvedTitle === siteName ? siteName : \`${resolvedTitle} | ${siteName}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const pageUrl = \`${SITE_URL}${url}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const imageValue = image?.url || image;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const pageImage = imageValue?.startsWith("http") ? imageValue : \`${SITE_URL}${imageValue}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const SITE_URL = String(import.meta.env.VITE_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");`.
- Line 5: `const DEFAULT_IMAGE = "/images/seo/default-og.jpg";`.
- Line 16: `const { settings = {} } = useSettings() || {};`.
- Line 17: `const siteName = settings.companyName || "Company";`.
- Line 18: `const resolvedTitle = title || siteName;`.
- Line 19: `const pageTitle = resolvedTitle === siteName ? siteName : \`${resolvedTitle} | ${siteName}\`;`.
- Line 20: `const pageUrl = \`${SITE_URL}${url}\`;`.
- Line 21: `const imageValue = image?.url || image;`.
- Line 22: `const pageImage = imageValue?.startsWith("http") ? imageValue : \`${SITE_URL}${imageValue}\`;`.

## Security, errors and performance checkpoints

- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
