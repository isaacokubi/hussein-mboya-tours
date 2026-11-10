# Source explanation: client/src/pages/TourDetails.jsx

**Source:** [client/src/pages/TourDetails.jsx](../../../client/src/pages/TourDetails.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `getTourImage`, `getTourImages` from `../utils/tourImage`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/tourImage](../../../client/src/utils/tourImage.js)
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useParams`, `useNavigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getTourBySlug` from `../api/tourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourApi](../../../client/src/api/tourApi.js)
- `getTourReviews` from `../api/reviewApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/reviewApi](../../../client/src/api/reviewApi.js)
- `ArrowRight`, `CalendarDays`, `Check`, `Clock3`, `MapPin`, `MessageCircle`, `MoonStar`, `Star`, `Utensils`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useSettings` from `../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `asList` — lines 21–21

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `displayText` — lines 22–22

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getLocalDateInputValue` — lines 23–27

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 24:** `const date = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `return date.toISOString().slice(0, 10);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatDuration` — lines 28–37

Parameters: `tour`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `const value = tour?.durationDetails?.days || tour?.durationDays || tour?.duration;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `if (value === undefined || value === null || value === "") return "Confirm duration";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `const text = String(value).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `if (/^\d+(?:\.\d+)?$/.test(text)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const days = Number(text);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `return \`${days} day${days === 1 ? "" : "s"}\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 36:** `return text;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatDate` — lines 38–44

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `if (!value) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `return Number.isNaN(date.getTime())` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `calculateReturnDate` — lines 45–55

Parameters: `tour`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 46:** `const startValue = tour?.startDate || tour?.date;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const duration = Number(tour?.durationDetails?.days || tour?.durationDays || tour?.duration || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `if (!startValue || !Number.isInteger(duration) || duration < 1 || duration > 365) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `const startKey = String(startValue).slice(0, 10);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const start = new Date(\`${startKey}T12:00:00\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `if (Number.isNaN(start.getTime())) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `return start;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `DetailList` — lines 57–74

Parameters: `{title, items, included}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 58:** `const values = asList(items).map((item) => typeof item === "string" ? item.trim() : "").filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `if (!values.length) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `const Icon = included ? Check : X;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ItineraryDay` — lines 76–139

Parameters: `{day, index}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 77:** `const dayNumber = Number(day?.day ?? day?.dayNumber) > 0 ? Number(day?.day ?? day?.dayNumber) : index + 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `const activities = asList(day?.activities)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `const meals = asList(day?.meals)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const title = displayText(day?.title || day?.name) || \`Day ${dayNumber}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const description = displayText(day?.description || day?.summary || day?.overview);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `const accommodation = displayText(day?.accommodation || day?.lodging);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `TourDetails` — lines 141–474

Parameters: none.
React hooks used: useState, useQuery. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 142:** `const { slug } = useParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 143:** `const { supportPhone, settings } = useSettings();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 144:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 145:** `const [whatsAppFormOpen, setWhatsAppFormOpen] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 146:** `const [whatsAppForm, setWhatsAppForm] = useState({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 149:** `const [whatsAppFormError, setWhatsAppFormError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 151:** `const { data, isLoading, error } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 158:** `const tour = data?.data || data;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 159:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 164:** `} = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 172:** `const reviews = Array.isArray(reviewsData?.reviews)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 178:** `if (isLoading) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 179:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 186:** `if (error || !tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 187:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 196:** `const image = getTourImage(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 197:** `const galleryImages = getTourImages(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 198:** `const hasUploadedGallery = [tour.featuredImage, ...(Array.isArray(tour.gallery) ? tour.gallery : []), ...(Array.isArray(tour.images) ? tour.images : [])].filter(Boolean).length > 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `handleBooking` — lines 217–217

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `handleWhatsAppBooking` — lines 219–263

Parameters: `event`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 222:** `const rawNumber = String(supportPhone || "").replace(/\D/g, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 223:** `const whatsappNumber = rawNumber.startsWith("0")` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 230:** `if (!whatsappNumber || whatsappNumber.length < 10) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 232:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 234:** `if (!whatsAppForm.fullName.trim()) return setWhatsAppFormError("Please enter the lead traveller’s full name.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 235:** `if (!whatsAppForm.phone.trim()) return setWhatsAppFormError("Please enter a contact phone number.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 236:** `if (!whatsAppForm.travelDate) return setWhatsAppFormError("Please choose your preferred travel date.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 237:** `const travelDate = new Date(\`${whatsAppForm.travelDate}T12:00:00\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 238:** `const today = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 240:** `if (Number.isNaN(travelDate.getTime()) || travelDate < today) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 241:** `return setWhatsAppFormError("Please choose today or a future travel date.");` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 243:** `const adults = Math.max(1, Math.min(50, Number(whatsAppForm.adults) || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 244:** `const children = Math.max(0, Math.min(50, Number(whatsAppForm.children) || 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 245:** `const lines = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 21: `const asList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);`.
- Line 22: `const displayText = (value) => (typeof value === "string" ? value.trim() : "");`.
- Line 23: `const getLocalDateInputValue = () => {`.
- Line 24: `const date = new Date();`.
- Line 28: `const formatDuration = (tour) => {`.
- Line 29: `const value = tour?.durationDetails?.days || tour?.durationDays || tour?.duration;`.
- Line 31: `const text = String(value).trim();`.
- Line 33: `const days = Number(text);`.
- Line 38: `const formatDate = (value) => {`.
- Line 40: `const date = new Date(value);`.
- Line 45: `const calculateReturnDate = (tour) => {`.
- Line 46: `const startValue = tour?.startDate || tour?.date;`.
- Line 47: `const duration = Number(tour?.durationDetails?.days || tour?.durationDays || tour?.duration || 0);`.
- Line 50: `const startKey = String(startValue).slice(0, 10);`.
- Line 51: `const start = new Date(\`${startKey}T12:00:00\`);`.
- Line 57: `function DetailList({ title, items, included = true }) {`.
- Line 58: `const values = asList(items).map((item) => typeof item === "string" ? item.trim() : "").filter(Boolean);`.
- Line 60: `const Icon = included ? Check : X;`.
- Line 76: `function ItineraryDay({ day, index }) {`.
- Line 77: `const dayNumber = Number(day?.day ?? day?.dayNumber) > 0 ? Number(day?.day ?? day?.dayNumber) : index + 1;`.
- Line 78: `const activities = asList(day?.activities)`.
- Line 81: `const meals = asList(day?.meals)`.
- Line 84: `const title = displayText(day?.title || day?.name) || \`Day ${dayNumber}\`;`.
- Line 85: `const description = displayText(day?.description || day?.summary || day?.overview);`.
- Line 86: `const accommodation = displayText(day?.accommodation || day?.lodging);`.
- Line 142: `const { slug } = useParams();`.
- Line 143: `const { supportPhone, settings } = useSettings();`.
- Line 144: `const navigate = useNavigate();`.
- Line 145: `const [whatsAppFormOpen, setWhatsAppFormOpen] = useState(false);`.
- Line 146: `const [whatsAppForm, setWhatsAppForm] = useState({`.
- Line 149: `const [whatsAppFormError, setWhatsAppFormError] = useState("");`.
- Line 151: `const { data, isLoading, error } = useQuery({`.
- Line 158: `const tour = data?.data || data;`.
- Line 159: `const {`.
- Line 172: `const reviews = Array.isArray(reviewsData?.reviews)`.
- Line 196: `const image = getTourImage(tour);`.
- Line 197: `const galleryImages = getTourImages(tour);`.
- Line 198: `const hasUploadedGallery = [tour.featuredImage, ...(Array.isArray(tour.gallery) ? tour.gallery : []), ...(Array.isArray(tour.images) ? tour.images : [])].filter(Boolean).length > 1`.
- Line 199: `const itinerarySource = Array.isArray(tour.itinerary)`.
- Line 202: `const itinerary = itinerarySource`.
- Line 206: `const highlights = asList(tour.highlights);`.
- Line 207: `const destination = typeof tour.destination === "object"`.
- Line 210: `const price = Number(tour.finalPrice ?? tour.discountPrice ?? (Number(tour.discount) > 0`.
- Line 213: `const currency = tour.currency || "KES";`.
- Line 214: `const departureDate = formatDate(tour.startDate || tour.date);`.
- Line 215: `const returnDate = formatDate(tour.endDate || calculateReturnDate(tour));`.
- Line 217: `const handleBooking = () => navigate(\`/checkout/tour/${tour._id}\`);`.
- Line 219: `const handleWhatsAppBooking = (event) => {`.
- Line 222: `const rawNumber = String(supportPhone || "").replace(/\D/g, "");`.
- Line 223: `const whatsappNumber = rawNumber.startsWith("0")`.
- Line 237: `const travelDate = new Date(\`${whatsAppForm.travelDate}T12:00:00\`);`.
- Line 238: `const today = new Date();`.
- Line 243: `const adults = Math.max(1, Math.min(50, Number(whatsAppForm.adults) || 1));`.
- Line 244: `const children = Math.max(0, Math.min(50, Number(whatsAppForm.children) || 0));`.
- Line 245: `const lines = [`.
- Line 433: `const stars = Math.max(0, Math.min(5, Number(review.rating) || 0));`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
