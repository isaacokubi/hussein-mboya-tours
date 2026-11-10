# Source explanation: client/src/components/common/LazyImage.jsx

**Source:** [client/src/components/common/LazyImage.jsx](../../../client/src/components/common/LazyImage.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `LazyImage` — lines 5–46

Parameters: `{src, alt, className, fallback}`.
React hooks used: useState, useEffect. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `const normalizedSource = typeof src === "object" ? src?.url : src;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const [imageSrc, setImageSrc] = useState(normalizedSource || fallback);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 13:** `const [loading, setLoading] = useState(true);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const [fallbackFailed, setFallbackFailed] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 34:** `if (imageSrc !== fallback) {` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 3: `const DEFAULT_IMAGE_FALLBACK = "/demo-destinations/kenya-landscape-01.svg";`.
- Line 11: `const normalizedSource = typeof src === "object" ? src?.url : src;`.
- Line 12: `const [imageSrc, setImageSrc] = useState(normalizedSource || fallback);`.
- Line 13: `const [loading, setLoading] = useState(true);`.
- Line 14: `const [fallbackFailed, setFallbackFailed] = useState(false);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
