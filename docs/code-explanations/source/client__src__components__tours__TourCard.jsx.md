# Source explanation: client/src/components/tours/TourCard.jsx

**Source:** [client/src/components/tours/TourCard.jsx](../../../client/src/components/tours/TourCard.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `addWishlist` from `../../api/wishlistApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/wishlistApi](../../../client/src/api/wishlistApi.js)
- `getTourImage`, `TOUR_FALLBACK_IMAGES` from `../../utils/tourImage`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/tourImage](../../../client/src/utils/tourImage.js)

## Runtime declarations and data flow

### `TourCard` — lines 10–92

Parameters: `{tour}`.
Persistent operations detected: TOUR_FALLBACK_IMAGES.find; verify tenant/ownership filters in the exact query. React hooks used: useState. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `const { settings = {} } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const currency = settings.currency || tour.currency || "KES";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const currencySymbolMap = { KES: "KSh", USD: "$", EUR: "€", GBP: "£" };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const currencySymbol = currencySymbolMap[currency] || settings.currencySymbol || tour.currencySymbol || currency;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const [adding, setAdding] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const [imageSrc, setImageSrc] = useState(() => getTourImage(tour) || TOUR_FALLBACK_IMAGES[0] || NO_IMAGE);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const [failedImageUrls, setFailedImageUrls] = useState(() => new Set());` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const price = Number(tour.price || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const discountedPrice = tour.discount ? price - (price * Number(tour.discount)) / 100 : price;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const tourTitle = tour.title || tour.name || "Amazing Safari Experience";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const destination = tour.destination && typeof tour.destination === "object" ? tour.destination : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const destinationName = destination?.name || tour.country || "Destination";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const destinationSlug = destination?.slug || destination?._id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const rating = typeof tour.rating === "object" ? tour.rating?.average : (tour.rating ?? tour.averageRating ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const handleWishlist = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 30:** `await addWishlist(tour._id);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `const handleImageError = () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `handleWishlist` — lines 27–38

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:
- **Line 28:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 30:** `await addWishlist(tour._id);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `handleImageError` — lines 40–56

Parameters: none.
Persistent operations detected: TOUR_FALLBACK_IMAGES.find; verify tenant/ownership filters in the exact query. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 41:** `const failed = new Set(failedImageUrls);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const nextImage = TOUR_FALLBACK_IMAGES.find(` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 48:** `if (nextImage) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `const NO_IMAGE = "/gallery/beach.jpg";`.
- Line 11: `const { settings = {} } = useSettings() || {};`.
- Line 12: `const currency = settings.currency || tour.currency || "KES";`.
- Line 13: `const currencySymbolMap = { KES: "KSh", USD: "$", EUR: "€", GBP: "£" };`.
- Line 14: `const currencySymbol = currencySymbolMap[currency] || settings.currencySymbol || tour.currencySymbol || currency;`.
- Line 15: `const [adding, setAdding] = useState(false);`.
- Line 16: `const [imageSrc, setImageSrc] = useState(() => getTourImage(tour) || TOUR_FALLBACK_IMAGES[0] || NO_IMAGE);`.
- Line 17: `const [failedImageUrls, setFailedImageUrls] = useState(() => new Set());`.
- Line 19: `const price = Number(tour.price || 0);`.
- Line 20: `const discountedPrice = tour.discount ? price - (price * Number(tour.discount)) / 100 : price;`.
- Line 21: `const tourTitle = tour.title || tour.name || "Amazing Safari Experience";`.
- Line 22: `const destination = tour.destination && typeof tour.destination === "object" ? tour.destination : null;`.
- Line 23: `const destinationName = destination?.name || tour.country || "Destination";`.
- Line 24: `const destinationSlug = destination?.slug || destination?._id;`.
- Line 25: `const rating = typeof tour.rating === "object" ? tour.rating?.average : (tour.rating ?? tour.averageRating ?? 0);`.
- Line 27: `const handleWishlist = async () => {`.
- Line 40: `const handleImageError = () => {`.
- Line 41: `const failed = new Set(failedImageUrls);`.
- Line 44: `const nextImage = TOUR_FALLBACK_IMAGES.find(`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
