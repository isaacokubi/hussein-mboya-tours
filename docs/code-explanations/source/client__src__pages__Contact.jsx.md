# Source explanation: client/src/pages/Contact.jsx

**Source:** [client/src/pages/Contact.jsx](../../../client/src/pages/Contact.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useSearchParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `motion` from `framer-motion`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Phone`, `Mail`, `MapPin`, `Send`, `MessageCircle`, `Clock` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `FaFacebook`, `FaInstagram` from `react-icons/fa`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useTenant` from `../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)
- `useSettings` from `../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `PaymentLink` from `./PaymentLink`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/pages/PaymentLink](../../../client/src/pages/PaymentLink.jsx)

## Runtime declarations and data flow

### `Contact` — lines 13–81

Parameters: none.
React hooks used: useState. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `const [searchParams] = useSearchParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const { tenant } = useTenant();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const { settings } = useSettings();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const companyName = settings?.companyName || tenant?.name || "Hussein Mboya Tours";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const businessPhone = String(settings?.supportPhone || tenant?.contactPhone || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const businessEmail = String(settings?.supportEmail || tenant?.contactEmail || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const [error, setError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const [sent, setSent] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const handleChange = (event) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const { name, value } = event.target;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const submitHandler = (event) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const name = form.name.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const email = form.email.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const phone = form.phone.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const message = form.message.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `handleChange` — lines 27–32

Parameters: `event`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 28:** `const { name, value } = event.target;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `submitHandler` — lines 34–50

Parameters: `event`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 38:** `const name = form.name.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const email = form.email.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const phone = form.phone.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const message = form.message.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (!name || !email || !message) return setError("Please enter your name, email address and inquiry message.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `if (!businessEmail) return setError("This tenant has not configured a support email yet.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `const subject = encodeURIComponent(\`Travel Inquiry from ${name}\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const body = encodeURIComponent(\`Hello ${companyName},\n\nI would like to make an inquiry.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\nMessage:\n${message}\n\nSent from the ${companyName} con` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 10: `const OFFICE_ADDRESS = "";`.
- Line 11: `const CONTACT_HERO = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=92";`.
- Line 14: `const [searchParams] = useSearchParams();`.
- Line 15: `<sensitive declaration redacted>`.
- Line 16: `const { tenant } = useTenant();`.
- Line 17: `const { settings } = useSettings();`.
- Line 18: `const companyName = settings?.companyName || tenant?.name || "Hussein Mboya Tours";`.
- Line 19: `const businessPhone = String(settings?.supportPhone || tenant?.contactPhone || "").trim();`.
- Line 20: `const businessEmail = String(settings?.supportEmail || tenant?.contactEmail || "").trim();`.
- Line 21: `const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });`.
- Line 22: `const [error, setError] = useState("");`.
- Line 23: `const [sent, setSent] = useState(false);`.
- Line 27: `const handleChange = (event) => {`.
- Line 28: `const { name, value } = event.target;`.
- Line 34: `const submitHandler = (event) => {`.
- Line 38: `const name = form.name.trim();`.
- Line 39: `const email = form.email.trim();`.
- Line 40: `const phone = form.phone.trim();`.
- Line 41: `const message = form.message.trim();`.
- Line 45: `const subject = encodeURIComponent(\`Travel Inquiry from ${name}\`);`.
- Line 46: `const body = encodeURIComponent(\`Hello ${companyName},\n\nI would like to make an inquiry.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\nMessage:\n${mess`.
- Line 52: `const mapHref = settings?.address ? \`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}\` : "";`.
- Line 55: `const details = [`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
