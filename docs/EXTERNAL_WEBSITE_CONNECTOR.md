# External Website → Central Travel ERP Connector

This feature lets a tenant keep its existing website while automatically sending booking/customer information into the central Travel ERP. No staff member needs to re-type the booking.

## How it works

```text
Customer's existing website
        |
        | small HMT connector / REST API
        v
Central Travel ERP
        |
        +--> Customer CRM
        +--> Booking
        +--> Tour inventory
        +--> Notifications
        +--> Finance/payment workflow
        +--> Audit/event log
```

A website still needs a one-time integration. A system cannot legally or technically read another site's form submissions without that site's owner installing/configuring an integration.

## 1. Create an integration key

A tenant admin calls:

`POST /api/integrations/keys`

with an authenticated admin session and:

```json
{
  "name": "Acme Safaris Website",
  "environment": "live",
  "allowedOrigins": ["https://www.acmesafaris.co.ke"]
}
```

The response contains a **secret API key** and a **public site key**. Store the secret securely and never put it in browser code. The public site key is designed to be used by the browser connector; it is still scoped to one tenant and can be restricted by allowed origins.

## 2. REST API

`POST /api/integrations/v1/bookings` (browser connector)

Headers:

```text
X-Public-Integration-Key: hmt_site_...
Content-Type: application/json
```

Example payload:

```json
{
  "tourId": "TOUR_MONGODB_ID",
  "travelDate": "2026-12-20",
  "numberOfGuests": 2,
  "externalBookingId": "ACME-WEB-10045",
  "customer": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+254700000000",
    "nationality": "Kenyan"
  },
  "pickupLocation": "JKIA",
  "hotelName": "Example Hotel",
  "specialRequests": "Vegetarian meals",
  "source": "acmesafaris.co.ke",
  "metadata": {
    "campaign": "google"
  }
}
```

The server recalculates the price from the tenant's tour and reserves inventory. Client-supplied totals are never trusted.

## 3. Existing website form auto-capture

For a normal HTML booking form, add:

```html
<form id="booking-form" data-hmt-booking-form data-tour-id="TOUR_MONGODB_ID">
  <input name="firstName" required>
  <input name="lastName" required>
  <input name="email" type="email">
  <input name="phone" required>
  <input name="travelDate" type="date" required>
  <input name="numberOfGuests" type="number" min="1" value="1">
  <input name="pickupLocation">
  <input name="hotelName">
  <textarea name="specialRequests"></textarea>
  <button type="submit">Book now</button>
</form>
```

Then load the tenant's connector script using the integration key. The connector recognizes common field names, sends the data directly to the ERP, and exposes `hmt:booking-created` and `hmt:booking-error` browser events for the existing site's UI.

For sites with unusual field names, use the REST API or add `name` attributes/data mappings rather than writing a custom backend import.

## Security

- Keys are stored as SHA-256 hashes.
- The plaintext secret is returned only at creation time.
- Keys are tenant-scoped.
- Keys can be revoked.
- Optional allowed-origin restrictions are supported.
- Permissions are scoped (`booking:create`, `customer:create`, `tour:read`).
- Server-side tour pricing is authoritative.
- External booking IDs make retries idempotent.
- Integration events are recorded for audit/troubleshooting.
- Do not collect payment-card details through this connector. Use the platform payment gateway's hosted/secure flow.

## Important legal/technical limitation

The feature does not and should not silently scrape arbitrary third-party websites. The website owner must authorize the integration by installing the connector, calling the API, or configuring a webhook/form handler. This keeps the system auditable and prevents unauthorized collection of customer data.


## Browser connector

The generated connector is loaded with the public site key:

```html
<script src="https://YOUR-ERP-DOMAIN/api/integrations/v1/widget.js?siteKey=YOUR_HMT_SITE_KEY"></script>
```

The site key is intentionally public. Never place the `hmt_live_...` secret API key in browser JavaScript. Server-to-server partners should use `POST /api/integrations/v1/server/bookings` with `X-API-Key`.

## Dynamic tour catalogue

A website can avoid hard-coding MongoDB IDs by calling:

`GET /api/integrations/v1/tours`

with the public site key. It returns published/available tours with slug, price, duration and availability information. A booking may then send either `tourId` or `tourSlug`.

## Automatic field capture

The browser connector maps common fields such as:

- first/last name and full name
- email
- phone/mobile
- nationality
- passport number
- national ID
- date of birth
- company/job title where supplied
- city/county/country
- travel date
- guests/travellers
- pickup location/time
- hotel/room
- special requests
- marketing-consent checkbox

It also records other named, non-sensitive form fields under `metadata.formFields` for the tenant's CRM/integration trail. It deliberately excludes password, file upload, payment-card/CVV/CVC, security-code, secret, token, authorization and CSRF fields.