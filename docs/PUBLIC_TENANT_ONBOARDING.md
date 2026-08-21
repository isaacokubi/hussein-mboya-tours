# Public Tenant Onboarding

The SaaS now supports public company registration from the existing `/register` page. Selecting **Register a Company** switches the page to company onboarding.

## Flow

1. Visitor enters company information.
2. Visitor chooses a plan.
3. System creates an isolated Organization/Tenant.
4. System creates the first Administrator inside that tenant.
5. System creates a 14-day trial Subscription.
6. On the very first company registration, the platform creates the first global SuperAdmin from server-side environment variables.
7. The new Admin receives a tenant-scoped JWT and is sent to the Admin dashboard.

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

The first public company registration requires these server-side secrets to exist:

- `BOOTSTRAP_SUPERADMIN_NAME`
- `BOOTSTRAP_SUPERADMIN_EMAIL`
- `BOOTSTRAP_SUPERADMIN_PHONE`
- `BOOTSTRAP_SUPERADMIN_PASSWORD`

They must never be exposed through Vite/client environment variables or committed to Git.

After a SuperAdmin already exists, public company registrations do not create additional SuperAdmins.

## Security

- Public onboarding is rate limited to 5 attempts per hour per client IP.
- Company slugs are unique.
- Administrator emails are unique.
- Administrator phone numbers require exactly 10 digits.
- Administrator passwords require at least 12 characters, an uppercase letter and a number.
- Tenant-scoped models are created inside the new tenant context.
- Tenant IDs are carried in the authentication token.
- The first SuperAdmin is created only when no active SuperAdmin exists.
- Subscription state is persisted independently from the Organization's embedded subscription summary.

## Production deployment

Configure the four `BOOTSTRAP_SUPERADMIN_*` variables only on the backend service. Do not add them to the frontend `.env` or Vercel environment.

Run the contract checks before deployment:

```bash
cd server
npm run check:public-onboarding
npm run check:models
npm run check:controllers
npm run check:multitenancy
```

The live database onboarding endpoint is intentionally not executed by CI because it creates real companies and privileged accounts.
