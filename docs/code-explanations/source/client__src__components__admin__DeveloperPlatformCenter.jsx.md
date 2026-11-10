# Source explanation: client/src/components/admin/DeveloperPlatformCenter.jsx

**Source:** [client/src/components/admin/DeveloperPlatformCenter.jsx](../../../client/src/components/admin/DeveloperPlatformCenter.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CheckCircle2`, `Copy`, `KeyRound`, `RefreshCw`, `Send`, `Trash2`, `Webhook` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)

## Runtime declarations and data flow

### `unwrap` — lines 7–7

Parameters: `response`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `DeveloperPlatformCenter` — lines 10–77

Parameters: none.
HTTP operations detected: api.get, api.post, api.patch, api.delete; response/error handling occurs in this function and its caller. React hooks used: useState, useQuery, useMutation. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const [name, setName] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 13:** `const [hook, setHook] = useState({ name: "", url: "", events: "booking.created,payment.completed" });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** Sensitive-configuration/data operation; inspect source without copying secret values. — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 17:** `const hooks = useQuery({ queryKey: ["dev-hooks"], queryFn: async () => unwrap(await api.get("/admin/developer/webhooks")) });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `const createKey = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** Sensitive-configuration/data operation; inspect source without copying secret values. — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 25:** `const revoke = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** Sensitive-configuration/data operation; inspect source without copying secret values. — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 31:** `const createHook = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 32:** `mutationFn: () => api.post("/admin/developer/webhooks", { ...hook, events: hook.events.split(",").map((x) => x.trim()).filter(Boolean) }),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 37:** `const updateHook = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 38:** `mutationFn: ({ id, active }) => api.patch(\`/admin/developer/webhooks/${id}\`, { active }),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 43:** `const testHook = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 44:** `mutationFn: (id) => api.post(\`/admin/developer/webhooks/${id}/test\`),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 49:** `const removeHook = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 50:** `mutationFn: (id) => api.delete(\`/admin/developer/webhooks/${id}\`),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `copySecret` — lines 55–59

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 56:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 7: `const unwrap = (response) => response?.data?.data ?? response?.data ?? [];`.
- Line 8: `const supportedEvents = ["booking.created", "booking.updated", "payment.completed", "payment.failed", "invoice.created", "invoice.updated"];`.
- Line 11: `const qc = useQueryClient();`.
- Line 12: `const [name, setName] = useState("");`.
- Line 13: `const [hook, setHook] = useState({ name: "", url: "", events: "booking.created,payment.completed" });`.
- Line 14: `<sensitive declaration redacted>`.
- Line 16: `<sensitive declaration redacted>`.
- Line 17: `const hooks = useQuery({ queryKey: ["dev-hooks"], queryFn: async () => unwrap(await api.get("/admin/developer/webhooks")) });`.
- Line 19: `const createKey = useMutation({`.
- Line 25: `const revoke = useMutation({`.
- Line 31: `const createHook = useMutation({`.
- Line 37: `const updateHook = useMutation({`.
- Line 43: `const testHook = useMutation({`.
- Line 49: `const removeHook = useMutation({`.
- Line 55: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
