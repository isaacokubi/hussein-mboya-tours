# `client/src/pages/Checkout.jsx` — booking form and payment state

Checkout supports a tour checkout and an existing-booking checkout. It coordinates server data and transient interaction state; it does not settle money or authoritatively price a booking.

## State model

- Component state holds date, guest count, phone, pickup/hotel details, special requests, selected method, payment amount, and ephemeral payment state.
- TanStack Query loads booking, tour and tenant public settings. Query keys include identity/host; `enabled` prevents irrelevant fetches before route kind/ID is known. `useMemo` unwraps response envelopes and derives available tenant-enabled methods, dates, balances and custom-request data.
- Effects hydrate form values from an existing booking or tour, clamp dates to an allowed date range, keep pickup time attached to the selected date, and constrain payment amount to the displayed balance/deposit minimum. Effects synchronize UX fields; server validation remains authoritative.

## Mutations

- M-Pesa mutation normalizes/validates the phone, posts booking ID/phone/amount, and requires a provider checkout ID before it displays a pending prompt. A success HTTP response is “prompt submitted,” not “paid.”
- Other-method mutation selects Stripe, PayPal, bank-transfer or cash wrapper. Stripe/PayPal require a returned URL before navigation. Bank/cash state explicitly tells the user staff verification remains necessary.
- Booking mutation creates a booking first, then begins the chosen payment flow in its success handler. This can yield a persisted booking even if payment initiation fails; UI error messaging should not imply the booking was rolled back.
- The M-Pesa polling effect checks saved status every three seconds for at most 60 attempts. A completion/failure stops the loop. Network errors are retried until the bound; timeout is a UI observation, not evidence that payment failed. Cleanup prevents timers firing after unmount/state change.

## Maintainability and security

Treat every browser value as untrusted: price, guest count, dates, phone, tenant selection and chosen method need backend checks. Do not store secrets in Vite variables. Ensure mutation errors preserve the server's request ID/message without exposing stack traces. Query keys/invalidation should include relevant tenant/user scope to avoid showing cached cross-account data.

## Walkthrough/demo

Open the network panel, submit a test booking, identify `POST /api/bookings`, then the selected payment request, and finally status polling. Explain the difference between booking persistence, STK acceptance, callback/provider verification and terminal booking payment state. For non-M-Pesa, demonstrate redirect or pending staff verification rather than claiming all methods settle through the same callback.

**Related:** [shared Axios explanation](axios-client.md), [API wrappers](api-modules/bookingApi.md), [core runtime walkthroughs](../../CORE_CODE_WALKTHROUGHS.md#4-frontend-state-and-api-communication).
