# Source explanation: client/src/components/seo/TourSchema.jsx

**Source:** [client/src/components/seo/TourSchema.jsx](../../../client/src/components/seo/TourSchema.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `Helmet` from `react-helmet-async`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `TourSchema` — lines 6–79

Parameters: `{tour}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `const { settings = {} } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `if (!tour) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `const image =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const schema = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const SITE_URL = String(import.meta.env.VITE_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");`.
- Line 7: `const { settings = {} } = useSettings() || {};`.
- Line 10: `const image =`.
- Line 15: `const schema = {`.

## Security, errors and performance checkpoints

- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
