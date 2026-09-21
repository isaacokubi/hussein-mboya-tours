# Public Tenant Onboarding

The SaaS supports public company registration from the existing `/register` page. Selecting **Register a Company** switches the page to company onboarding.

## Flow

1. Visitor enters company information.
2. Visitor chooses a plan.
3. System creates an isolated Organization/Tenant.
4. System creates the first Administrator inside that tenant.
5. System creates a 14-day trial Subscription.
6. The new Admin receives a tenant-scoped JWT and is sent to the Admin dashboard.
7. Platform SuperAdmin provisioning is handled separately by the server-side bootstrap script and is never part of public tenant registration.

## Public API

`POST /api/public/onboarding/register`

Example body:

```json
{
  "company": {
    "name": "Example Safaris",
    "slug": "example-safaris",
    "country": "Kenya",
    "timezone": "Africa/Nairobi",
    "currency": "KES"
  },
  "plan": "starter",
  "admin": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "0712345678",
    "password": "StrongPassword123!"
  }
}
```

## Plans

| Plan | Trial | Seats |
|---|---:|---:|
| Starter | 14 days | 5 |
| Professional | 14 days | 15 |
| Business | 14 days | 50 |
| Enterprise | 14 days | 250 |

## First SuperAdmin configuration

Public tenant registration does **not** require `BOOTSTRAP_SUPERADMIN_*` variables and does not create a global SuperAdmin. This keeps public onboarding independent from platform-level privileged account provisioning.

To provision the first platform SuperAdmin, configure these server-side secrets and run the dedicated bootstrap command:

- `BOOTSTRAP_SUPERADMIN_NAME`
- `BOOTSTRAP_SUPERADMIN_EMAIL`
- `BOOTSTRAP_SUPERADMIN_PHONE`
- `BOOTSTRAP_SUPERADMIN_PASSWORD`

They must never be exposed through Vite/client environment variables or committed to Git.

```bash
cd server
npm run bootstrap:first
```

The bootstrap script is safe to run only as a controlled server/deployment operation; public users must never be able to invoke it.

## Security

- Public onboarding is rate limited to 5 attempts per hour per client IP.
- Company slugs are unique.
- Administrator emails are unique.
- Administrator phone numbers require exactly 10 digits.
- Administrator passwords require at least 12 characters, an uppercase letter and a number.
- Tenant-scoped models are created inside the new tenant context.
- Tenant IDs are carried in the authentication token.
- Platform SuperAdmin creation is separate from public tenant registration.
- Subscription state is persisted independently from the Organization's embedded subscription summary.
- Paid subscriptions enter a bounded grace period after renewal expiry before the tenant is suspended. Configure `SUBSCRIPTION_GRACE_PERIOD_DAYS` on the server if a value other than the default 3 days is required; the runtime caps it at 30 days.

## Production deployment

Configure the four `BOOTSTRAP_SUPERADMIN_*` variables only on the backend service when running the controlled bootstrap operation. Do not add them to the frontend `.env` or Vercel environment.

Configure authoritative tenant plan prices through the platform billing configuration. Tenant checkout derives its amount from those platform settings and does not trust a client-supplied amount.

Run the contract checks before deployment:

```bash
cd server
npm run check:models
npm run check:controllers
npm run check:multitenancy:live
npm test
```

The live database onboarding endpoint is intentionally not executed by CI because it creates real companies and privileged accounts.
