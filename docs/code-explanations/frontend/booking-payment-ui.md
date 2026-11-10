# Booking API and payment UI

## API wrapper: `client/src/api/bookingApi.js`

The module imports shared Axios and exports small async functions for list/create/retrieve/cancel/reschedule/status/travel-date requests. Each wrapper chooses a relative API path and generally returns `response.data`, leaving transport/error behavior in the shared Axios client. `getMyBookings` filters out TanStack Query context objects accidentally passed as params, then adds a bounded default page size before spreading caller params.

## Payment status screen

`PaymentStatus.jsx` reads booking ID and query-string provider/type/session values. It uses `useQuery` to fetch either hospitality payment details or booking details. Its `refetchInterval` inspects persisted status and balance; settled/final statuses or zero balance stop polling, otherwise it polls every five seconds. It chooses status/invoice/booking fields from the relevant response shape.

Mutations call hospitality M-Pesa/card/bank wrappers or PayPal capture, then invalidate the appropriate query cache. A `useRef` guard prevents the PayPal capture mutation from being started repeatedly during rerenders on the return URL. UI states distinguish loading, missing reservation, waiting verification, paid and failed/cancelled. The page's “successful” display is based on returned persisted booking/payment state; the initial provider redirect alone is not confirmation.

Payment controls collect phone, amount, reference or notes. Frontend checks (e.g. required phone/reference and amount input bounds) improve UX; backend must repeat authoritative amount, ownership and provider validation.
