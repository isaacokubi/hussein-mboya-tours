# External Website Connector — Quick Start

1. Log into the tenant Admin dashboard.
2. Open **Settings → Existing website → automatic booking capture**.
3. Enter the existing website origin, for example `https://www.example.co.ke`.
4. Create the connector.
5. Save the displayed `secretApiKey` and `publicSiteKey` securely. The secret must never be placed in browser JavaScript.
6. On the existing booking form, add `data-hmt-booking-form` and `data-tour-id="<central-tour-id>"`.
7. Add the script:

```html
<script src="https://YOUR-ERP-DOMAIN/api/integrations/v1/widget.js?siteKey=YOUR_HMT_SITE_KEY"></script>
```

8. Ensure form controls have normal `name` attributes such as `firstName`, `lastName`, `email`, `phone`, `travelDate`, `numberOfGuests`, `hotelName`, `pickupLocation`, and `specialRequests`.
9. Test a booking. It should appear automatically in Customer Management and Booking Management and have an invoice.

For a custom website/application backend, call `POST /api/integrations/v1/server/bookings` with `X-API-Key: hmt_live_...` instead of exposing the secret in the browser.