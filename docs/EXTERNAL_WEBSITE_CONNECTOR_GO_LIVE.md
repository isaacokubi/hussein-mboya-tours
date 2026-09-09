# Global Tours external website capture — go-live implementation

This is the one-time onboarding and operating contract for a tour company's existing website. The website owner explicitly authorizes the integration; Global Tours does not scrape or silently read unrelated websites.

## 1. Website onboarding

An administrator opens **Admin → Settings → Existing website → automatic booking capture**, enters the production website origins, and creates a live connector. A publishable `hmt_site_...` key is returned for browser use. The secret `hmt_live_...` key is for server-to-server use only.

## 2. Embeddable booking capture

For a browser form, load the tenant's widget:

```html
<script src="https://YOUR-ERP-DOMAIN/api/integrations/v1/widget.js?siteKey=YOUR_HMT_SITE_KEY"></script>
```

Mark an existing booking form with `data-hmt-booking-form` and provide `data-tour-id="TOUR_ID"`. The connector captures common customer and booking fields without requiring the website to be rebuilt.

## 3. Tour catalogue synchronization

The authorized browser connector can read published, available tours from:

`GET /api/integrations/v1/tours`

It can also read tenant configuration from:

`GET /api/integrations/v1/config`

Only tours belonging to the authenticated integration tenant are returned.

## 4. Automatic customer capture

The booking endpoint normalizes the submitted customer contact details, finds an existing customer by tenant-scoped phone/email, updates that record when appropriate, or creates a new customer when the integration has `customer:create` permission.

## 5. Automatic booking creation

The connector sends travel date, guest count, customer details, pickup/hotel information, travelers and supported booking metadata to:

`POST /api/integrations/v1/bookings`

The server validates the tour, date, phone, capacity and calculated price before creating the booking. The booking then enters the normal Global Tours operational workflow.

## 6. Duplicate protection

Every integration booking should supply a stable `externalBookingId`. Repeated delivery of the same external ID is treated as an idempotent retry rather than a second booking. Server-to-server partners should use the same identifier and the secret `X-API-Key` authentication path.

## 7. Audit trail

Accepted and rejected integration events are recorded in the tenant-scoped `WebsiteIntegrationEvent` collection. This provides an operational evidence trail for duplicate submissions, successful captures and rejected requests.

## 8. Security controls

- Browser code receives only the publishable site key.
- Secret API keys must never be placed in HTML, JavaScript bundles or browser storage.
- Website origins are explicitly allow-listed for live connectors.
- Integration permissions are enforced server-side.
- Integration endpoints are rate-limited.
- High-risk browser fields such as passwords, card data, CVV/CVC, authorization tokens and CSRF fields are excluded from automatic form capture.
- Tenant context is established from the integration key and server queries remain tenant-scoped.
- Revocation immediately disables an integration key.

## 9. Administration and monitoring

The Admin Settings integration panel provides connector creation, publishable key visibility, allowed-origin visibility, usage count and immediate revocation. The backend records integration events for operational auditing.

For a production deployment, monitor:

- integration request rate and HTTP errors;
- rejected origin/key/permission requests;
- `booking.created`, `booking.rejected` and `booking.duplicate` events;
- customer/booking creation rates;
- capacity conflicts;
- payment and invoicing follow-up failures.

## 10. Kenyan operational hand-off

Captured bookings remain inside the normal Global Tours tenant workflow. Staff can continue with customer communication, payment collection, M-Pesa/card/bank processing, invoicing/eTIMS workflows, tour operations, supplier/fleet assignment and reporting without re-keying the original website booking.

### Server-to-server example

```http
POST /api/integrations/v1/server/bookings
X-API-Key: hmt_live_...
Content-Type: application/json

{
  "tourSlug": "maasai-mara-3-days",
  "travelDate": "2026-12-15",
  "numberOfGuests": 2,
  "externalBookingId": "partner-2026-000123",
  "customer": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+254700000000"
  }
}
```

The external company remains responsible for obtaining the permissions and notices required to transmit its customers' information. Global Tours only processes an explicitly authorized integration request.
