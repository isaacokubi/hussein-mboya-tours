# Source explanation: client/src/components/destinations/DestinationCard.jsx

**Source:** [client/src/components/destinations/DestinationCard.jsx](../../../client/src/components/destinations/DestinationCard.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `LazyImage` from `../common/LazyImage`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/common/LazyImage](../../../client/src/components/common/LazyImage.jsx)

## Runtime declarations and data flow

### `resolveMediaUrl` — lines 15–27

Parameters: `value`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `if (!value) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const raw = typeof value === "string"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `if (!raw) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `if (/^(https?:|data:|blob:)/i.test(raw)) return raw;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `if (/^\/(?:destinations|gallery|demo-destinations)\//.test(raw) || /^\/hero\d+\.(?:jpe?g|png|webp)$/i.test(raw)) return raw;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `const base = String(import.meta.env.VITE_API_URL || "")` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 26:** `return raw.startsWith("/") && base ? \`${base}${raw}\` : raw;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getFallbackImage` — lines 29–36

Parameters: `destination`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 30:** `const stable = String(destination?._id || destination?.slug || destination?.name || "destination");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const hash = [...stable].reduce(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `return FALLBACK_DESTINATION_IMAGES[hash % FALLBACK_DESTINATION_IMAGES.length];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `DestinationCard` — lines 38–81

Parameters: `{destination}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 39:** `const candidates = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const imageUrl = resolveMediaUrl(candidates.find(Boolean)) || getFallbackImage(destination);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 48:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const FALLBACK_DESTINATION_IMAGES = [`.
- Line 15: `const resolveMediaUrl = (value) => {`.
- Line 17: `const raw = typeof value === "string"`.
- Line 23: `const base = String(import.meta.env.VITE_API_URL || "")`.
- Line 29: `const getFallbackImage = (destination) => {`.
- Line 30: `const stable = String(destination?._id || destination?.slug || destination?.name || "destination");`.
- Line 31: `const hash = [...stable].reduce(`.
- Line 39: `const candidates = [`.
- Line 46: `const imageUrl = resolveMediaUrl(candidates.find(Boolean)) || getFallbackImage(destination);`.

## Security, errors and performance checkpoints

- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
