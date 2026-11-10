# Source explanation: client/src/components/admin/OperationsActionCenter.jsx

**Source:** [client/src/components/admin/OperationsActionCenter.jsx](../../../client/src/components/admin/OperationsActionCenter.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Building2`, `CircleDollarSign`, `FilePlus2`, `Handshake`, `Receipt`, `Send` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createCorporateAccount`, `createPurchaseOrder`, `createSupplier`, `createSupplierPayable`, `createTourCost`, `paySupplierPayable`, `reconcileCorporateAccount`, `transitionPurchaseOrder` from `../../api/operationsModuleApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/operationsModuleApi](../../../client/src/api/operationsModuleApi.js)

## Runtime declarations and data flow

### `money` — lines 8–8

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `OperationsActionCenter` — lines 10–35

Parameters: `{suppliers, purchaseOrders, payables, corporate}`.
React hooks used: useState, useMutation.

Key statements:
- **Line 11:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const refresh = () => ["operations-suppliers", "operations-purchase-orders", "operations-tour-costs", "operations-payables", "operations-corporate", "operations-overview"].forEach((key) => qc.invalidateQueries({ queryKey` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const [notice, setNotice] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const run = (fn) => ({ mutationFn: fn, onSuccess: () => { setNotice("Saved successfully."); refresh(); }, onError: (e) => setNotice(e?.response?.data?.message || e?.message || "Unable to save record.") });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const supplierMutation = useMutation(run(createSupplier));` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const corporateMutation = useMutation(run(createCorporateAccount));` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const poMutation = useMutation(run(createPurchaseOrder));` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const costMutation = useMutation(run(createTourCost));` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const payableMutation = useMutation(run(createSupplierPayable));` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const payMutation = useMutation({ mutationFn: ({ id, amount, paymentReference }) => paySupplierPayable(id, amount, paymentReference), onSuccess: () => { setNotice("Supplier payment recorded."); refresh(); }, onError: (e)` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const poStatusMutation = useMutation({ mutationFn: ({ id, status }) => transitionPurchaseOrder(id, status), onSuccess: () => { setNotice("Purchase order status updated."); refresh(); }, onError: (e) => setNotice(e?.respo` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const reconcileMutation = useMutation({ mutationFn: reconcileCorporateAccount, onSuccess: () => { setNotice("Corporate account reconciled."); refresh(); }, onError: (e) => setNotice(e?.response?.data?.message || e?.messa` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `return <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `refresh` — lines 12–12

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `run` — lines 14–14

Parameters: `fn`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `FormCard` — lines 36–36

Parameters: `{icon, title, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Form` — lines 37–37

Parameters: `{children, onSubmit, busy, submit}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 38–38

Parameters: `{name, label, type, required, min, step, defaultValue}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Select` — lines 39–39

Parameters: `{name, label, options, labels, required}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `PayableAction` — lines 40–40

Parameters: `{payables, onPay, busy}`.
React hooks used: useState.

Key statements:
- **Line 40:** `function PayableAction({payables,onPay,busy}){const [id,setId]=useState(""); const [amount,setAmount]=useState(""); const [ref,setRef]=useState(""); return <div className="rounded-xl bg-slate-50 p-4"><p className="mb-2 t` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `StatusAction` — lines 41–41

Parameters: `{rows, onChange, busy}`.
React hooks used: useState.

Key statements:
- **Line 41:** `function StatusAction({rows,onChange,busy}){const [id,setId]=useState(""); const [status,setStatus]=useState("submitted"); return <div className="rounded-xl bg-slate-50 p-4"><p className="mb-2 text-sm font-bold">Update p` — Uses a React hook to manage component state, side effects, memoization, or server state.

### `CorporateAction` — lines 42–42

Parameters: `{rows, onReconcile, busy}`.
React hooks used: useState.

Key statements:
- **Line 42:** `function CorporateAction({rows,onReconcile,busy}){const [id,setId]=useState(""); return <div className="rounded-xl bg-slate-50 p-4"><p className="mb-2 text-sm font-bold">Reconcile corporate account</p><select className={` — Uses a React hook to manage component state, side effects, memoization, or server state.

## Module-level declarations

- Line 6: `const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";`.
- Line 7: `const btn = "rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50";`.
- Line 8: `const money = (v) => Number(v || 0);`.
- Line 11: `const qc = useQueryClient();`.
- Line 12: `const refresh = () => ["operations-suppliers", "operations-purchase-orders", "operations-tour-costs", "operations-payables", "operations-corporate", "operations-overview"].forEach(`.
- Line 13: `const [notice, setNotice] = useState("");`.
- Line 14: `const run = (fn) => ({ mutationFn: fn, onSuccess: () => { setNotice("Saved successfully."); refresh(); }, onError: (e) => setNotice(e?.response?.data?.message || e?.message || "Una`.
- Line 15: `const supplierMutation = useMutation(run(createSupplier));`.
- Line 16: `const corporateMutation = useMutation(run(createCorporateAccount));`.
- Line 17: `const poMutation = useMutation(run(createPurchaseOrder));`.
- Line 18: `const costMutation = useMutation(run(createTourCost));`.
- Line 19: `const payableMutation = useMutation(run(createSupplierPayable));`.
- Line 20: `const payMutation = useMutation({ mutationFn: ({ id, amount, paymentReference }) => paySupplierPayable(id, amount, paymentReference), onSuccess: () => { setNotice("Supplier payment`.
- Line 21: `const poStatusMutation = useMutation({ mutationFn: ({ id, status }) => transitionPurchaseOrder(id, status), onSuccess: () => { setNotice("Purchase order status updated."); refresh(`.
- Line 22: `const reconcileMutation = useMutation({ mutationFn: reconcileCorporateAccount, onSuccess: () => { setNotice("Corporate account reconciled."); refresh(); }, onError: (e) => setNotic`.
- Line 36: `function FormCard({icon:Icon,title,children}){return <div className="rounded-2xl border border-slate-200 p-5"><div className="mb-4 flex items-center gap-2"><Icon size={18} classNam`.
- Line 37: `function Form({children,onSubmit,busy,submit}){return <form onSubmit={onSubmit} className="space-y-3">{children}<button className={btn} disabled={busy}>{busy?"Saving…":submit}</but`.
- Line 38: `function Field({name,label,type="text",required,min,step,defaultValue}){return <label className="block text-xs font-semibold text-slate-600">{label}<input className={input} name={n`.
- Line 39: `function Select({name,label,options,labels={},required}){return <label className="block text-xs font-semibold text-slate-600">{label}<select className={input} name={name} required=`.
- Line 40: `function PayableAction({payables,onPay,busy}){const [id,setId]=useState(""); const [amount,setAmount]=useState(""); const [ref,setRef]=useState(""); return <div className="rounded-`.
- Line 41: `function StatusAction({rows,onChange,busy}){const [id,setId]=useState(""); const [status,setStatus]=useState("submitted"); return <div className="rounded-xl bg-slate-50 p-4"><p cla`.
- Line 42: `function CorporateAction({rows,onReconcile,busy}){const [id,setId]=useState(""); return <div className="rounded-xl bg-slate-50 p-4"><p className="mb-2 text-sm font-bold">Reconcile `.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
