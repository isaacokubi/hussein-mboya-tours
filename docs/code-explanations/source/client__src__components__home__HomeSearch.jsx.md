# Source explanation: client/src/components/home/HomeSearch.jsx

**Source:** [client/src/components/home/HomeSearch.jsx](../../../client/src/components/home/HomeSearch.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `Search`, `MapPin`, `Sparkles`, `UsersRound`, `CalendarDays` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useNavigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `HomeSearch` — lines 7–38

Parameters: none.
React hooks used: useState. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const [query, setQuery] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 10:** `const [experience, setExperience] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 11:** `const [duration, setDuration] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 12:** `const [travellers, setTravellers] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const submit = (event) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const params = new URLSearchParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `if (query.trim()) params.set("search", query.trim());` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (experience) params.set("category", EXPERIENCE_TO_CATEGORY[experience] || experience);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `if (duration) params.set("duration", duration);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `if (travellers) params.set("travellers", travellers);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `submit` — lines 14–22

Parameters: `event`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `const params = new URLSearchParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `if (query.trim()) params.set("search", query.trim());` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (experience) params.set("category", EXPERIENCE_TO_CATEGORY[experience] || experience);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `if (duration) params.set("duration", duration);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `if (travellers) params.set("travellers", travellers);` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 5: `const EXPERIENCE_TO_CATEGORY = { Safari: "Safari", Beach: "Beach", Mountain: "Mountain", Culture: "Culture", Family: "Family", Honeymoon: "Honeymoon", Luxury: "Luxury", Corporate: `.
- Line 8: `const navigate = useNavigate();`.
- Line 9: `const [query, setQuery] = useState("");`.
- Line 10: `const [experience, setExperience] = useState("");`.
- Line 11: `const [duration, setDuration] = useState("");`.
- Line 12: `const [travellers, setTravellers] = useState("");`.
- Line 14: `const submit = (event) => {`.
- Line 16: `const params = new URLSearchParams();`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
