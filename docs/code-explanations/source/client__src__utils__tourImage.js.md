# Source explanation: client/src/utils/tourImage.js

**Source:** [client/src/utils/tourImage.js](../../../client/src/utils/tourImage.js)

## Purpose

A client utility/helper used by pages, hooks, or components; inspect its exported functions for exact transformation rules.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `isGenericImage` — lines 29–38

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `const raw = typeof value === "string"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (!raw) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const normalized = raw.toLowerCase().trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `return normalized.endsWith("/hero1.jpeg") ||` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getFallbackIndex` — lines 40–47

Parameters: `tour (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 41:** `const seed = String(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `return Math.abs(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `resolveMediaUrl` — lines 49–61

Parameters: `value`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 50:** `if (!value) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `const raw = typeof value === "string"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `if (!raw) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `if (/^(https?:|data:|blob:)/i.test(raw)) return raw;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `if (/^\/(?:destinations|gallery|demo-destinations)\//.test(raw) || /^\/hero\d+\.(?:jpe?g|png|webp)$/i.test(raw)) return raw;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `const base = String(import.meta.env.VITE_API_URL || "")` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 60:** `return raw.startsWith("/") && base ? \`${base}${raw}\` : raw;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTourImage` — lines 63–78

Parameters: `tour (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 64:** `const candidates = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `const realImage = candidates.find((candidate) => !isGenericImage(candidate));` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 73:** `const resolved = resolveMediaUrl(realImage);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `return resolved || TOUR_FALLBACK_IMAGES[getFallbackIndex(tour)] || TOUR_IMAGE_PLACEHOLDER;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTourImages` — lines 80–97

Parameters: `tour (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 81:** `const media = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `if (media.length) return [...new Set(media)];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 92:** `const index = getFallbackIndex(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `return [` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 1: `const TOUR_IMAGE_PLACEHOLDER = "/images/image-placeholder.jpg";`.
- Line 5: `const TOUR_FALLBACK_IMAGES = [`.
- Line 29: `const isGenericImage = (value) => {`.
- Line 30: `const raw = typeof value === "string"`.
- Line 34: `const normalized = raw.toLowerCase().trim();`.
- Line 40: `const getFallbackIndex = (tour = {}) => {`.
- Line 41: `const seed = String(`.
- Line 49: `export const resolveMediaUrl = (value) => {`.
- Line 51: `const raw = typeof value === "string"`.
- Line 57: `const base = String(import.meta.env.VITE_API_URL || "")`.
- Line 63: `export const getTourImage = (tour = {}) => {`.
- Line 64: `const candidates = [`.
- Line 72: `const realImage = candidates.find((candidate) => !isGenericImage(candidate));`.
- Line 73: `const resolved = resolveMediaUrl(realImage);`.
- Line 80: `export const getTourImages = (tour = {}) => {`.
- Line 81: `const media = [`.
- Line 92: `const index = getFallbackIndex(tour);`.

## Security, errors and performance checkpoints

- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
