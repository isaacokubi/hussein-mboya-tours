# Source explanation: client/src/pages/Checkout.jsx

**Source:** [client/src/pages/Checkout.jsx](../../../client/src/pages/Checkout.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useNavigate`, `useParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createBooking`, `getBookingById`, `updateBookingTravelDate` from `../api/bookingApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/bookingApi](../../../client/src/api/bookingApi.js)
- `getMyCustomTourRequests` from `../api/customTourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/customTourApi](../../../client/src/api/customTourApi.js)
- `initiateMpesa`, `checkPaymentStatus` from `../api/mpesaApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/mpesaApi](../../../client/src/api/mpesaApi.js)
- `getTourById` from `../api/tourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourApi](../../../client/src/api/tourApi.js)
- `getPublicSettings` from `../api/settingsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/settingsApi](../../../client/src/api/settingsApi.js)
- `createBankTransferPayment`, `createCashPayment`, `createPaypalOrder`, `createStripeCheckout` from `../api/checkoutPaymentsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/checkoutPaymentsApi](../../../client/src/api/checkoutPaymentsApi.js)
- `useAuth` from `../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `getCustomTourDateRange`, `getTourDateRange`, `isDateWithinRange`, `toDateInputValue` from `../lib/dateRange`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/lib/dateRange](../../../client/src/lib/dateRange.js)

## Runtime declarations and data flow

### `normalizePhone` — lines 14–19

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `let phone = String(value || "").replace(/\D/g, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (phone.startsWith("0")) phone = \`254${phone.slice(1)}\`;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (phone.startsWith("7") || phone.startsWith("1")) phone = \`254${phone}\`;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `return phone;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validPhone` — lines 20–20

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrapBooking` — lines 21–21

Parameters: `response`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrapTour` — lines 22–22

Parameters: `response`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrapCustomRequests` — lines 23–23

Parameters: `response`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrapSettings` — lines 24–24

Parameters: `response`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `toLocalDateTime` — lines 26–38

Parameters: `value`, `dateFallback`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 27:** `if (!value) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `const raw = String(value).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const timeOnly = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(raw);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `if (timeOnly) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `const base = dateFallback ? new Date(dateFallback) : new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `if (Number.isNaN(base.getTime())) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `return \`${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}T${String(Number(timeOnly[1])).padStart(2, "0")}:${timeOnly[2]}\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 35:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `if (Number.isNaN(date.getTime())) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `return \`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Checkout` — lines 40–397

Parameters: none.
React hooks used: useState, useQuery, useMemo, useEffect, useMutation. 9 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 53 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 41:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const { type, id } = useParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const { user } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const isBookingCheckout = type === "booking";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const isTourCheckout = type === "tour";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const [travelDate, setTravelDate] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 48:** `const [travellers, setTravellers] = useState("1");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 49:** `const [phone, setPhone] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 50:** `const [pickupLocation, setPickupLocation] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 51:** `const [pickupTime, setPickupTime] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 52:** `const [hotelName, setHotelName] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 53:** `const [roomNumber, setRoomNumber] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 54:** `const [specialRequests, setSpecialRequests] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 55:** `const [paymentAmount, setPaymentAmount] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 56:** `const [paymentState, setPaymentState] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 57:** `const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("MPESA");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 59:** `const { data: bookingResponse, isLoading: bookingLoading } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 64:** `const { data: tourResponse, isLoading: tourLoading } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `startPayment` — lines 219–222

Parameters: `{bookingId, phoneNumber, amount}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 220:** `if (selectedPaymentMethod === "MPESA") return paymentMutation.mutateAsync({ bookingId, phoneNumber, amount });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 221:** `return otherPaymentMutation.mutateAsync({ bookingId, method: selectedPaymentMethod, amount });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `poll` — lines 229–249

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 230:** `if (cancelled) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 232:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 233:** `const response = await checkPaymentStatus(paymentState.checkoutRequestId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 234:** `const data = response?.data || response || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 235:** `const payment = data?.payment || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 236:** `const status = String(data?.status || payment?.status || "pending").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 237:** `if (status === "completed") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 240:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 242:** `if (status === "failed" || status === "cancelled") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 244:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 247:** `if (!cancelled && attempts < 60) timer = window.setTimeout(poll, 3000);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 248:** `if (!cancelled && attempts >= 60) setPaymentState((current) => ({ ...current, status: "timeout", message: "Payment confirmation is taking longer than expected. Check your booking or retry." }));` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `submit` — lines 264–322

Parameters: `event`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 16 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 266:** `if (isTourCheckout) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 267:** `const travellerCount = Number(travellers);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 268:** `if (!Number.isInteger(travellerCount) || travellerCount < 1) return toast.error("Enter at least 1 traveller.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 270:** `if (!total || total <= 0) return toast.error("This booking has no valid total cost. Please contact the tour operator.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 271:** `if (balance <= 0) return toast.info("This booking is already fully paid.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 272:** `const amount = Number(paymentAmount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 273:** `if (!Number.isInteger(amount) || amount < minimumInitialPayment || amount > balance) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 274:** `return toast.error(\`Enter an amount between KES ${minimumInitialPayment.toLocaleString()} and KES ${balance.toLocaleString()}.\`);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 276:** `if (!travelDate) return toast.error("Please select a travel date.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 277:** `if (dateRange.min && dateRange.max && !isDateWithinRange(travelDate, dateRange.min, dateRange.max)) return toast.error(\`Select a travel date between ${dateRange.min} and ${dateRange.max}.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 278:** `if (!pickupLocation.trim()) return toast.error("Please enter the pickup location.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 279:** `if (!pickupTime) return toast.error("Please select the pickup date and time.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 280:** `const pickupDate = pickupTime.slice(0, 10);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 281:** `if (!dateRange.min || !dateRange.max || !isDateWithinRange(pickupDate, dateRange.min, dateRange.max)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 282:** `return toast.error(\`Pickup date must be between ${dateRange.min} and ${dateRange.max}.\`);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 284:** `if (pickupDate !== travelDate) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 285:** `return toast.error("Pickup date must match the selected travel date.");` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 287:** `if (selectedPaymentMethod === "MPESA" && !validPhone(normalizePhone(phone))) return toast.error("Enter a valid Safaricom M-Pesa number.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `Stat` — lines 399–399

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Detail` — lines 400–400

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 401–401

Parameters: `{label, required, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 14: `const normalizePhone = (value) => {`.
- Line 15: `let phone = String(value || "").replace(/\D/g, "");`.
- Line 20: `const validPhone = (value) => /^254[17]\d{8}$/.test(value);`.
- Line 21: `const unwrapBooking = (response) => response?.data?.booking || response?.booking || response?.data || response || null;`.
- Line 22: `const unwrapTour = (response) => response?.data?.data || response?.data?.tour || response?.data || response?.tour || response || null;`.
- Line 23: `const unwrapCustomRequests = (response) => response?.data?.requests || response?.requests || response?.data || response || [];`.
- Line 24: `const unwrapSettings = (response) => response?.settings || response?.data?.settings || response?.data || response || {};`.
- Line 26: `const toLocalDateTime = (value, dateFallback) => {`.
- Line 28: `const raw = String(value).trim();`.
- Line 29: `const timeOnly = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(raw);`.
- Line 31: `const base = dateFallback ? new Date(dateFallback) : new Date();`.
- Line 35: `const date = new Date(value);`.
- Line 41: `const navigate = useNavigate();`.
- Line 42: `const { type, id } = useParams();`.
- Line 43: `const { user } = useAuth();`.
- Line 44: `const isBookingCheckout = type === "booking";`.
- Line 45: `const isTourCheckout = type === "tour";`.
- Line 47: `const [travelDate, setTravelDate] = useState("");`.
- Line 48: `const [travellers, setTravellers] = useState("1");`.
- Line 49: `const [phone, setPhone] = useState("");`.
- Line 50: `const [pickupLocation, setPickupLocation] = useState("");`.
- Line 51: `const [pickupTime, setPickupTime] = useState("");`.
- Line 52: `const [hotelName, setHotelName] = useState("");`.
- Line 53: `const [roomNumber, setRoomNumber] = useState("");`.
- Line 54: `const [specialRequests, setSpecialRequests] = useState("");`.
- Line 55: `const [paymentAmount, setPaymentAmount] = useState("");`.
- Line 56: `const [paymentState, setPaymentState] = useState(null);`.
- Line 57: `const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("MPESA");`.
- Line 59: `const { data: bookingResponse, isLoading: bookingLoading } = useQuery({`.
- Line 64: `const { data: tourResponse, isLoading: tourLoading } = useQuery({`.
- Line 69: `const { data: settingsResponse, isLoading: settingsLoading, isError: settingsError } = useQuery({`.
- Line 77: `const booking = useMemo(() => unwrapBooking(bookingResponse), [bookingResponse]);`.
- Line 78: `const tour = useMemo(() => unwrapTour(tourResponse), [tourResponse]);`.
- Line 79: `const settings = useMemo(() => unwrapSettings(settingsResponse), [settingsResponse]);`.
- Line 80: `const availablePaymentMethods = useMemo(() => [`.
- Line 90: `const bookingDepositRate = Math.min(100, Math.max(0, Number(settings?.bookingDepositPercentage ?? settings?.defaultBookingDepositPercentage ?? 0)));`.
- Line 92: `const customRequestId = typeof booking?.customTourRequest === "string" ? booking.customTourRequest : booking?.customTourRequest?._id || "";`.
- Line 93: `const { data: customRequestsResponse, isLoading: customRequestLoading } = useQuery({`.
- Line 98: `const customRequest = useMemo(() => {`.
- Line 100: `const requests = unwrapCustomRequests(customRequestsResponse);`.
- Line 103: `const custom = booking?.customTourSnapshot || customRequest || {};`.
- Line 105: `const dateRange = useMemo(() => {`.
- Line 111: `const baseTourPrice = Number(tour?.price ?? tour?.tourPrice ?? tour?.pricePerPerson ?? 0);`.
- Line 112: `const total = isBookingCheckout ? Number(booking?.totalAmount || booking?.quotedAmount || 0) : baseTourPrice * Number(travellers || 0);`.
- Line 113: `const storedPaid = Number(booking?.depositAmount ?? booking?.amountPaid ?? booking?.paidAmount ?? booking?.paymentSummary?.paid ?? 0);`.
- Line 114: `const amountPaid = isBookingCheckout && String(booking?.paymentStatus || "").toLowerCase() === "pending" && storedPaid >= total && total > 0 ? 0 : storedPaid;`.
- Line 115: `const balance = Math.max(total - amountPaid, 0);`.
- Line 116: `const configuredDeposit = Math.round((total * bookingDepositRate) / 100);`.
- Line 117: `const minimumInitialPayment = Math.min(balance, configuredDeposit);`.
- Line 121: `const bookingTravelDate = booking.travelDate || custom.startDate || dateRange.min || "";`.
- Line 122: `const bookingPickupTime = booking.pickupTime || custom.pickupTime || "";`.
- Line 123: `const bookingPickupDate = booking.pickupDate || custom.pickupDate || bookingTravelDate;`.
- Line 135: `const scheduledDate = tour.travelDate || tour.date || tour.startDate || tour.departureDate || tour.nextDepartureDate || tour.startDateTime || dateRange.min || "";`.
- Line 136: `const scheduledPickupTime = tour.pickupTime || tour.departureTime || tour.startTime || tour.meetingTime || "";`.
- Line 137: `const scheduledPickupLocation = tour.pickupLocation || tour.meetingPoint || tour.meetingLocation || tour.departurePoint || "";`.
- Line 138: `const tourDate = toDateInputValue(scheduledDate);`.
- Line 161: `const time = current?.includes("T") ? current.slice(11, 16) : "";`.
- Line 169: `const value = Number(current);`.
- Line 175: `const paymentMutation = useMutation({`.
- Line 177: `const normalized = normalizePhone(phoneNumber);`.
- Line 179: `const response = await initiateMpesa({ bookingId, phoneNumber: normalized, amount: Number(amount) });`.
- Line 180: `const data = response?.data || response || {};`.
- Line 181: `const checkoutRequestId = data.CheckoutRequestID || data.checkoutRequestID;`.
- Line 189: `const otherPaymentMutation = useMutation({`.
- Line 199: `const redirect = response?.url || response?.data?.url;`.
- Line 205: `const redirect = response?.url || response?.data?.url;`.
- Line 210: `const message = method === "BANK_TRANSFER"`.
- Line 219: `const startPayment = ({ bookingId, phoneNumber, amount }) => {`.
- Line 226: `let cancelled = false;`.
- Line 227: `let timer;`.
- Line 228: `let attempts = 0;`.
- Line 229: `const poll = async () => {`.
- Line 233: `const response = await checkPaymentStatus(paymentState.checkoutRequestId);`.
- Line 234: `const data = response?.data || response || {};`.
- Line 235: `const payment = data?.payment || {};`.
- Line 236: `const status = String(data?.status || payment?.status || "pending").toLowerCase();`.
- Line 254: `const createBookingMutation = useMutation({`.
- Line 257: `const created = unwrapBooking(response);`.
- Line 264: `const submit = async (event) => {`.
- Line 267: `const travellerCount = Number(travellers);`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
