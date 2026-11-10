# Source explanation: client/src/context/CartContext.jsx

**Source:** [client/src/context/CartContext.jsx](../../../client/src/context/CartContext.jsx)

## Purpose

A React context/provider module for state shared across component branches.

## Imports and dependencies

- `createContext`, `useContext`, `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `CartProvider` — lines 14–177

Parameters: `{children}`.
React hooks used: useState, useEffect. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `const [cart,setCart] = useState(` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `useEffect(()=>{` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const savedCart =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `if(savedCart){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `useEffect(()=>{` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 66:** `const addToCart = (item)=>{` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `const exists =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `prev.find(` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 79:** `if(exists){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `return prev;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 86:** `return [` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 103:** `const removeFromCart = (id)=>{` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 123:** `const clearCart = ()=>{` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 134:** `const total = cart.reduce(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 151:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `addToCart` — lines 66–95

Parameters: `item`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 72:** `const exists =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `prev.find(` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 79:** `if(exists){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `return prev;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 86:** `return [` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `removeFromCart` — lines 103–115

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `clearCart` — lines 123–127

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `useCart` — lines 183–189

Parameters: none.
React hooks used: useContext.

Key statements:
- **Line 185:** `return useContext(` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 10: `const CartContext = createContext();`.
- Line 14: `export function CartProvider({`.
- Line 19: `const [cart,setCart] = useState(`.
- Line 28: `const savedCart =`.
- Line 66: `const addToCart = (item)=>{`.
- Line 72: `const exists =`.
- Line 103: `const removeFromCart = (id)=>{`.
- Line 123: `const clearCart = ()=>{`.
- Line 134: `const total = cart.reduce(`.
- Line 183: `export function useCart(){`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
