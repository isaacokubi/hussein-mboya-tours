# Source explanation: client/src/components/admin/Pagination.jsx

**Source:** [client/src/components/admin/Pagination.jsx](../../../client/src/components/admin/Pagination.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `Pagination` — lines 1–38

Parameters: `{page, pages, total, pageSize, onPageChange}`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 2:** `const currentPage = Math.max(1, Number(page) || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 3:** `const totalPages = Math.max(1, Number(pages) || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 4:** `const totalItems = Math.max(0, Number(total) || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 5:** `const size = Math.max(1, Number(pageSize) || 10);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `if (totalPages <= 1) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 8:** `const start = totalItems ? ((currentPage - 1) * size) + 1 : 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const end = Math.min(currentPage * size, totalItems);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const items = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const add = (value) => { if (!items.includes(value)) items.push(value); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (currentPage > 3) add("ellipsis-left");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p += 1) add(p);` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 15:** `if (currentPage < totalPages - 2) add("ellipsis-right");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `const handlePageChange = (nextPage) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const target = Math.min(totalPages, Math.max(1, Number(nextPage) || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `if (target !== currentPage) onPageChange?.(target);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `if (typeof item === "string" && item.startsWith("ellipsis")) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `return <span key={item} className="px-2 text-slate-400" aria-hidden="true">…</span>;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `add` — lines 11–11

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `handlePageChange` — lines 18–21

Parameters: `nextPage`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `const target = Math.min(totalPages, Math.max(1, Number(nextPage) || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `if (target !== currentPage) onPageChange?.(target);` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 2: `const currentPage = Math.max(1, Number(page) || 1);`.
- Line 3: `const totalPages = Math.max(1, Number(pages) || 1);`.
- Line 4: `const totalItems = Math.max(0, Number(total) || 0);`.
- Line 5: `const size = Math.max(1, Number(pageSize) || 10);`.
- Line 8: `const start = totalItems ? ((currentPage - 1) * size) + 1 : 0;`.
- Line 9: `const end = Math.min(currentPage * size, totalItems);`.
- Line 10: `const items = [];`.
- Line 11: `const add = (value) => { if (!items.includes(value)) items.push(value); };`.
- Line 18: `const handlePageChange = (nextPage) => {`.
- Line 19: `const target = Math.min(totalPages, Math.max(1, Number(nextPage) || 1));`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
