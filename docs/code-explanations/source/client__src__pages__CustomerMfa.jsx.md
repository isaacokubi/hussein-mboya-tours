# Source explanation: client/src/pages/CustomerMfa.jsx

**Source:** [client/src/pages/CustomerMfa.jsx](../../../client/src/pages/CustomerMfa.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useNavigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)

## Runtime declarations and data flow

### `CustomerMfa` — lines 6–73

Parameters: `{userId, devPin}`.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. React hooks used: useState. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `const [pin, setPin] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 9:** `const [error, setError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 10:** `const [loading, setLoading] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 12:** `const handleVerify = async (e) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (!userId) return setError("Your login verification session has expired. Please login again.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (!/^\d{4}$/.test(pin)) return setError("Enter the 4-digit PIN sent to your registered phone.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 20:** `const { data } = await api.post("/mfa/customer/verify-pin", { userId, pin });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `if (data.user) localStorage.setItem("user", JSON.stringify(data.user));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `if (data.user?.tenantId) localStorage.setItem("tenantId", String(data.user.tenantId?._id || data.user.tenantId));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `if (data.user?.tenantSlug) localStorage.setItem("tenantSlug", String(data.user.tenantSlug));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const resendPin = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 38:** `const { data } = await api.post("/mfa/customer/send-pin", { userId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 47:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `handleVerify` — lines 12–32

Parameters: `e`.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `if (!userId) return setError("Your login verification session has expired. Please login again.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (!/^\d{4}$/.test(pin)) return setError("Enter the 4-digit PIN sent to your registered phone.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 20:** `const { data } = await api.post("/mfa/customer/verify-pin", { userId, pin });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `if (data.user) localStorage.setItem("user", JSON.stringify(data.user));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `if (data.user?.tenantId) localStorage.setItem("tenantId", String(data.user.tenantId?._id || data.user.tenantId));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `if (data.user?.tenantSlug) localStorage.setItem("tenantSlug", String(data.user.tenantSlug));` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `resendPin` — lines 34–45

Parameters: none.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:
- **Line 35:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 38:** `const { data } = await api.post("/mfa/customer/send-pin", { userId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 7: `const navigate = useNavigate();`.
- Line 8: `const [pin, setPin] = useState("");`.
- Line 9: `const [error, setError] = useState("");`.
- Line 10: `const [loading, setLoading] = useState(false);`.
- Line 12: `const handleVerify = async (e) => {`.
- Line 20: `const { data } = await api.post("/mfa/customer/verify-pin", { userId, pin });`.
- Line 34: `const resendPin = async () => {`.
- Line 38: `const { data } = await api.post("/mfa/customer/send-pin", { userId });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
