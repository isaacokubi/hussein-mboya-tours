# Source explanation: client/src/pages/ForgotPassword.jsx

**Source:** [client/src/pages/ForgotPassword.jsx](../../../client/src/pages/ForgotPassword.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useNavigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useSettings` from `../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `useTenant` from `../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)
- `requestPasswordReset`, `resetPasswordWithCode` from `../api/passwordResetApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/passwordResetApi](../../../client/src/api/passwordResetApi.js)

## Runtime declarations and data flow

### `ForgotPassword` — lines 8–85

Parameters: none.
React hooks used: useState. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const { settings = {} } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const { tenant = {} } = useTenant() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const companyName = String(settings?.companyName || tenant?.name || tenant?.companyName || "Hussein Mboya Tours").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const [step, setStep] = useState(1);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const [email, setEmail] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const [code, setCode] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** Sensitive-configuration/data operation; inspect source without copying secret values. — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const [confirm, setConfirm] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const [loading, setLoading] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [resendLoading, setResendLoading] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const requestCode = async (event) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const normalizedEmail = email.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return toast.error("Enter a valid email address.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 27:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `const reset = async (event) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `if (!/^\d{6}$/.test(code)) return toast.error("Enter the 6-digit reset code from your email.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `requestCode` — lines 21–33

Parameters: `event`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 23:** `const normalizedEmail = email.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return toast.error("Enter a valid email address.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 27:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `reset` — lines 35–48

Parameters: `event`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 37:** `if (!/^\d{6}$/.test(code)) return toast.error("Enter the 6-digit reset code from your email.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 42:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `resend` — lines 50–58

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:
- **Line 51:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 53:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 9: `const navigate = useNavigate();`.
- Line 10: `const { settings = {} } = useSettings() || {};`.
- Line 11: `const { tenant = {} } = useTenant() || {};`.
- Line 12: `const companyName = String(settings?.companyName || tenant?.name || tenant?.companyName || "Hussein Mboya Tours").trim();`.
- Line 13: `const [step, setStep] = useState(1);`.
- Line 14: `const [email, setEmail] = useState("");`.
- Line 15: `const [code, setCode] = useState("");`.
- Line 16: `<sensitive declaration redacted>`.
- Line 17: `const [confirm, setConfirm] = useState("");`.
- Line 18: `const [loading, setLoading] = useState(false);`.
- Line 19: `const [resendLoading, setResendLoading] = useState(false);`.
- Line 21: `const requestCode = async (event) => {`.
- Line 23: `const normalizedEmail = email.trim().toLowerCase();`.
- Line 27: `<sensitive declaration redacted>`.
- Line 35: `const reset = async (event) => {`.
- Line 42: `<sensitive declaration redacted>`.
- Line 50: `const resend = async () => {`.
- Line 53: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
