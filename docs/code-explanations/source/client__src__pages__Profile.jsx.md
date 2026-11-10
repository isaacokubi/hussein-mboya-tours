# Source explanation: client/src/pages/Profile.jsx

**Source:** [client/src/pages/Profile.jsx](../../../client/src/pages/Profile.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)
- `useAuth` from `../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `Mail`, `ShieldCheck`, `KeyRound` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `normalizeProfile` — lines 8–13

Parameters: `response`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Profile` — lines 15–336

Parameters: none.
HTTP operations detected: api.get, api.put, api.post; response/error handling occurs in this function and its caller. React hooks used: useState, useEffect. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 16 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `const { user, setUser, loading: authLoading } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const userId = user?._id || user?.id || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const [profile, setProfile] = useState(user);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [form, setForm] = useState({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** Sensitive-configuration/data operation; inspect source without copying secret values. — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const [emailVerificationCode, setEmailVerificationCode] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const [emailPending, setEmailPending] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const [emailConfirming, setEmailConfirming] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const [loading, setLoading] = useState(true);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const [saving, setSaving] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 31:** `if (authLoading) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `if (!userId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 39:** `let mounted = true;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const fetchProfile = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 45:** `const response = await api.get("/users/profile");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `fetchProfile` — lines 41–71

Parameters: none.
HTTP operations detected: api.get; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 44:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 45:** `const response = await api.get("/users/profile");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `const nextProfile = normalizeProfile(response);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `if (!mounted) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `if (!nextProfile) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `throw new Error("The profile response did not contain user data.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 63:** `if (mounted && error.response?.status !== 401) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 69:** `if (mounted) setLoading(false);` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `handleChange` — lines 84–87

Parameters: `event`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 85:** `const { name, value } = event.target;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `handleSubmit` — lines 89–129

Parameters: `event`.
HTTP operations detected: api.put; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 92:** `const name = form.name.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `const phone = form.phone.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 95:** `if (!name || !phone) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 100:** `if (!/^\d{10}$/.test(phone)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 102:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 107:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 108:** `const response = await api.put("/users/profile", { name, phone });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 109:** `const updatedProfile = normalizeProfile(response);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 111:** `if (updatedProfile) {` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 8: `const normalizeProfile = (response) =>`.
- Line 16: `const { user, setUser, loading: authLoading } = useAuth();`.
- Line 17: `const userId = user?._id || user?.id || null;`.
- Line 18: `const [profile, setProfile] = useState(user);`.
- Line 19: `const [form, setForm] = useState({`.
- Line 23: `<sensitive declaration redacted>`.
- Line 24: `const [emailVerificationCode, setEmailVerificationCode] = useState("");`.
- Line 25: `const [emailPending, setEmailPending] = useState(false);`.
- Line 26: `const [emailConfirming, setEmailConfirming] = useState(false);`.
- Line 27: `const [loading, setLoading] = useState(true);`.
- Line 28: `const [saving, setSaving] = useState(false);`.
- Line 39: `let mounted = true;`.
- Line 41: `const fetchProfile = async () => {`.
- Line 45: `const response = await api.get("/users/profile");`.
- Line 46: `const nextProfile = normalizeProfile(response);`.
- Line 84: `const handleChange = (event) => {`.
- Line 85: `const { name, value } = event.target;`.
- Line 89: `const handleSubmit = async (event) => {`.
- Line 92: `const name = form.name.trim();`.
- Line 93: `const phone = form.phone.trim();`.
- Line 108: `const response = await api.put("/users/profile", { name, phone });`.
- Line 109: `const updatedProfile = normalizeProfile(response);`.
- Line 152: `const role =`.
- Line 236: `const newEmail = emailForm.newEmail.trim().toLowerCase();`.
- Line 241: `const response = await api.post("/auth/email-change/request", {`.
- Line 277: `const response = await api.post("/auth/email-change/confirm", { code: emailVerificationCode });`.
- Line 278: `const updatedUser = normalizeProfile(response) || response.data?.user;`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
