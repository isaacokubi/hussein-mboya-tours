# Source explanation: client/src/components/booking/TravellerForm.jsx

**Source:** [client/src/components/booking/TravellerForm.jsx](../../../client/src/components/booking/TravellerForm.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `TravelerForm` — lines 11–447

Parameters: `{onChange}`.
React hooks used: useState, useEffect. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `useState([` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 52:** `useEffect(()=>{` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 55:** `if(onChange){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 72:** `const updateTraveler=(index,field,value)=>{` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `const updated = travelers.map(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 115:** `const addTraveler=()=>{` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 145:** `const removeTraveler=(index)=>{` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 148:** `if(travelers.length===1){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 150:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 177:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateTraveler` — lines 72–105

Parameters: `index`, `field`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 75:** `const updated = travelers.map(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `addTraveler` — lines 115–135

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `removeTraveler` — lines 145–167

Parameters: `index`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 148:** `if(travelers.length===1){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 150:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 21: `const [`.
- Line 72: `const updateTraveler=(index,field,value)=>{`.
- Line 75: `const updated = travelers.map(`.
- Line 115: `const addTraveler=()=>{`.
- Line 145: `const removeTraveler=(index)=>{`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
