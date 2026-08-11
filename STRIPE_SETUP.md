# Stripe + bank transfer setup

Add `STRIPE_SECRET_KEY=sk_live_...` (or test key) to the server environment. The checkout endpoint uses Stripe Checkout through the Stripe REST API, so no SDK is required.

For production, set `CLIENT_URL` to the deployed frontend URL. Bank-transfer payments remain pending until an administrator verifies them in Admin > Payments and marks the payment completed/paid.

M-Pesa remains the default option.
