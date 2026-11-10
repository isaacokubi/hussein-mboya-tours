# Source explanation: client/src/components/admin/AddVehicleModal.jsx

**Source:** [client/src/components/admin/AddVehicleModal.jsx](../../../client/src/components/admin/AddVehicleModal.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createVehicle`, `updateVehicle`, `getDrivers`, `assignDriver` from `../../api/vehicleApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/vehicleApi](../../../client/src/api/vehicleApi.js)
- `ImagePlus`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `existingImage` — lines 5–5

Parameters: `vehicle`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AddVehicleModal` — lines 7–80

Parameters: `{close, refresh, vehicle}`.
React hooks used: useState, useEffect. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `const [drivers, setDrivers] = useState([]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 9:** `const [loading, setLoading] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 10:** `const [error, setError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 11:** `const [preview, setPreview] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 12:** `const [form, setForm] = useState({ name: "", registrationNumber: "", model: "", manufacturer: "", year: "", type: "SUV", capacity: "", driver: "", fuelType: "Diesel", transmission: "Manual", description: "", image: null ` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `if (!vehicle) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `const handleChange = (event) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const { name, value, files } = event.target;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (name === "image") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const file = files?.[0] || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 36:** `const submit = async (event) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 40:** `const capacity = Number(form.capacity);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const year = form.year === "" ? null : Number(form.year);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `handleChange` — lines 24–34

Parameters: `event`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `const { name, value, files } = event.target;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (name === "image") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const file = files?.[0] || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `submit` — lines 36–55

Parameters: `event`.
4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 40:** `const capacity = Number(form.capacity);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const year = form.year === "" ? null : Number(form.year);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capacity)) throw new Error("Passenger capacity must be a whole number greater than 0.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `if (year !== null && (!Number.isFinite(year) || year < 1990 || year > new Date().getFullYear() + 1)) throw new Error(\`Vehicle year must be between 1990 and ${new Date().getFullYear() + 1}.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `const data = new FormData();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `if (year !== null) data.append("year", String(year));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `const response = vehicle ? await updateVehicle(vehicle._id, data) : await createVehicle(data);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 49:** `const saved = response?.data || response?.vehicle;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `if (form.driver && saved?._id && String(form.driver) !== String(vehicle?.driver?._id || vehicle?.driver || "")) await assignDriver(saved._id, form.driver);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `await refresh(); close();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `Field` — lines 82–82

Parameters: `{className, ...}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Select` — lines 83–83

Parameters: `{children, ...}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 5: `const existingImage = (vehicle) => vehicle?.image?.url || vehicle?.image?.secure_url || (typeof vehicle?.image === "string" ? vehicle.image : "");`.
- Line 8: `const [drivers, setDrivers] = useState([]);`.
- Line 9: `const [loading, setLoading] = useState(false);`.
- Line 10: `const [error, setError] = useState("");`.
- Line 11: `const [preview, setPreview] = useState("");`.
- Line 12: `const [form, setForm] = useState({ name: "", registrationNumber: "", model: "", manufacturer: "", year: "", type: "SUV", capacity: "", driver: "", fuelType: "Diesel", transmission:`.
- Line 24: `const handleChange = (event) => {`.
- Line 25: `const { name, value, files } = event.target;`.
- Line 27: `const file = files?.[0] || null;`.
- Line 36: `const submit = async (event) => {`.
- Line 40: `const capacity = Number(form.capacity);`.
- Line 41: `const year = form.year === "" ? null : Number(form.year);`.
- Line 44: `const data = new FormData();`.
- Line 48: `const response = vehicle ? await updateVehicle(vehicle._id, data) : await createVehicle(data);`.
- Line 49: `const saved = response?.data || response?.vehicle;`.
- Line 82: `function Field({ className = "", ...props }) { return <input {...props} className={\`w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-800 outli`.
- Line 83: `function Select({ children, ...props }) { return <select {...props} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 outline-none `.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
