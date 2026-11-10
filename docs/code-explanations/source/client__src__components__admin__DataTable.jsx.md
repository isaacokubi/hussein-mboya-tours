# Source explanation: client/src/components/admin/DataTable.jsx

**Source:** [client/src/components/admin/DataTable.jsx](../../../client/src/components/admin/DataTable.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Pagination` from `./Pagination`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/Pagination](../../../client/src/components/admin/Pagination.jsx)

## Runtime declarations and data flow

### `DataTable` — lines 6–34

Parameters: `{columns, data, pageSize, paginate}`.
React hooks used: useState, useEffect, useMemo. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `const [page, setPage] = useState(1);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 8:** `const safePageSize = Math.min(15, Math.max(10, Number(pageSize) || DEFAULT_PAGE_SIZE));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const safeValue = (value) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `if (value === null || value === undefined) return "-";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `if (typeof value === "object") return JSON.stringify(value);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `return value;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 14:** `const pages = paginate ? Math.max(1, Math.ceil(data.length / safePageSize)) : 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `useEffect(() => { setPage((current) => Math.min(current, pages)); }, [pages]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `useEffect(() => { setPage(1); }, [data.length, safePageSize]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const visibleRows = useMemo(() => paginate ? data.slice((page - 1) * safePageSize, page * safePageSize) : data, [data, page, safePageSize, paginate]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `safeValue` — lines 9–13

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `if (value === null || value === undefined) return "-";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `if (typeof value === "object") return JSON.stringify(value);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `return value;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const DEFAULT_PAGE_SIZE = 10;`.
- Line 7: `const [page, setPage] = useState(1);`.
- Line 8: `const safePageSize = Math.min(15, Math.max(10, Number(pageSize) || DEFAULT_PAGE_SIZE));`.
- Line 9: `const safeValue = (value) => {`.
- Line 14: `const pages = paginate ? Math.max(1, Math.ceil(data.length / safePageSize)) : 1;`.
- Line 17: `const visibleRows = useMemo(() => paginate ? data.slice((page - 1) * safePageSize, page * safePageSize) : data, [data, page, safePageSize, paginate]);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
