# Source explanation: client/src/pages/agent/AgentQuotes.jsx

**Source:** [client/src/pages/agent/AgentQuotes.jsx](../../../client/src/pages/agent/AgentQuotes.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `Calculator`, `FileText`, `Plus`, `RefreshCw`, `Send`, `Trash2` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)
- `getAgentQuotations`, `createQuotation`, `updateQuotationStatus` from `../../api/quotationApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/quotationApi](../../../client/src/api/quotationApi.js)

## Runtime declarations and data flow

### `money` — lines 8–8

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusTone` — lines 9–9

Parameters: `status`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `AgentQuotes` — lines 11–48

Parameters: none.
HTTP operations detected: api.get; response/error handling occurs in this function and its caller. React hooks used: useQuery, useState, useMemo, useMutation. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const quotesQuery = useQuery({ queryKey: ["agent-quotes"], queryFn: getAgentQuotations, staleTime: 30000, refetchOnMount: "always" });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const customersQuery = useQuery({ queryKey: ["agent-customers"], queryFn: async () => (await api.get("/agent/customers")).data, staleTime: 30000 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 15:** `const packagesQuery = useQuery({ queryKey: ["agent-packages"], queryFn: async () => (await api.get("/agent/packages")).data, staleTime: 30000 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 16:** `const [open, setOpen] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const [customer, setCustomer] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const [tourPackage, setTourPackage] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [validUntil, setValidUntil] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const [notes, setNotes] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const [taxRate, setTaxRate] = useState(0);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const [discount, setDiscount] = useState(0);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const [items, setItems] = useState([{ ...emptyItem, name: "Safari package" }]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const quotes = Array.isArray(quotesQuery.data?.quotations) ? quotesQuery.data.quotations : Array.isArray(quotesQuery.data?.data) ? quotesQuery.data.data : Array.isArray(quotesQuery.data?.quotes) ? quotesQuery.data.quotes` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const customers = Array.isArray(customersQuery.data?.customers) ? customersQuery.data.customers : Array.isArray(customersQuery.data?.data) ? customersQuery.data.data : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const packages = Array.isArray(packagesQuery.data?.packages) ? packagesQuery.data.packages : Array.isArray(packagesQuery.data?.data) ? packagesQuery.data.data : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const subtotal = useMemo(() => items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0), [items]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const discountAmount = Math.min(subtotal, Math.max(0, Number(discount) || 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const taxable = Math.max(0, subtotal - discountAmount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `submit` — lines 35–35

Parameters: `e`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `updateItem` — lines 36–36

Parameters: `index`, `patch`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const emptyItem = { name: "", category: "Other", description: "", quantity: 1, unitPrice: "" };`.
- Line 8: `const money = (value) => { const n = Number(value); return Number.isFinite(n) ? \`KES ${n.toLocaleString("en-KE")}\` : "—"; };`.
- Line 9: `const statusTone = (status) => { const s = String(status || "unknown").toLowerCase(); if (["accepted","approved","sent"].includes(s)) return "bg-emerald-50 text-emerald-700 ring-em`.
- Line 12: `const qc = useQueryClient();`.
- Line 13: `const quotesQuery = useQuery({ queryKey: ["agent-quotes"], queryFn: getAgentQuotations, staleTime: 30000, refetchOnMount: "always" });`.
- Line 14: `const customersQuery = useQuery({ queryKey: ["agent-customers"], queryFn: async () => (await api.get("/agent/customers")).data, staleTime: 30000 });`.
- Line 15: `const packagesQuery = useQuery({ queryKey: ["agent-packages"], queryFn: async () => (await api.get("/agent/packages")).data, staleTime: 30000 });`.
- Line 16: `const [open, setOpen] = useState(false);`.
- Line 17: `const [customer, setCustomer] = useState("");`.
- Line 18: `const [tourPackage, setTourPackage] = useState("");`.
- Line 19: `const [validUntil, setValidUntil] = useState("");`.
- Line 20: `const [notes, setNotes] = useState("");`.
- Line 21: `const [taxRate, setTaxRate] = useState(0);`.
- Line 22: `const [discount, setDiscount] = useState(0);`.
- Line 23: `const [items, setItems] = useState([{ ...emptyItem, name: "Safari package" }]);`.
- Line 24: `const quotes = Array.isArray(quotesQuery.data?.quotations) ? quotesQuery.data.quotations : Array.isArray(quotesQuery.data?.data) ? quotesQuery.data.data : Array.isArray(quotesQuery`.
- Line 25: `const customers = Array.isArray(customersQuery.data?.customers) ? customersQuery.data.customers : Array.isArray(customersQuery.data?.data) ? customersQuery.data.data : [];`.
- Line 26: `const packages = Array.isArray(packagesQuery.data?.packages) ? packagesQuery.data.packages : Array.isArray(packagesQuery.data?.data) ? packagesQuery.data.data : [];`.
- Line 27: `const subtotal = useMemo(() => items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0), [items]);`.
- Line 28: `const discountAmount = Math.min(subtotal, Math.max(0, Number(discount) || 0));`.
- Line 29: `const taxable = Math.max(0, subtotal - discountAmount);`.
- Line 30: `const taxAmount = taxable * (Math.max(0, Number(taxRate) || 0) / 100);`.
- Line 31: `const estimatedTotal = taxable + taxAmount;`.
- Line 33: `const createMutation = useMutation({ mutationFn: createQuotation, onSuccess: () => { setOpen(false); setItems([{ ...emptyItem, name: "Safari package" }]); setCustomer(""); setTourP`.
- Line 34: `const statusMutation = useMutation({ mutationFn: updateQuotationStatus, onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-quotes"] }) });`.
- Line 35: `const submit = (e) => { e.preventDefault(); const validItems = items.filter(i => i.name.trim() && Number(i.quantity) > 0 && Number(i.unitPrice) >= 0); if (!customer || !tourPackage`.
- Line 36: `const updateItem = (index, patch) => setItems((current) => current.map((item, i) => i === index ? { ...item, ...patch } : item));`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
