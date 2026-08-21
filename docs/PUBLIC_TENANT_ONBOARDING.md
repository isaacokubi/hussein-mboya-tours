# Public Tenant Onboarding

## Flow

1. Visitor opens `/register?company=1` or chooses **Register a Company** from the normal registration page.
2. Company information and the first Administrator are collected.
3. A tenant/Organization is created with isolated data context.
4. The first Administrator is created automatically inside that tenant.
5. A 14-day trial Subscription is provisioned.
6. If the platform has no active SuperAdmin, the first global SuperAdmin is created from backend-only environment variables.
7. The new Administrator receives a tenant-scoped JWT and is sent to `/admin`.

## API

`POST /api/public/onboarding/register`

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

## Trial plans

- Starter: 5 seats, 14 days
- Professional: 15 seats, 14 days
- Business: 50 seats, 14 days
- Enterprise: 250 seats, 14 days

## First SuperAdmin

The first public registration requires these backend environment variables:

- `BOOTSTRAP_SUPERADMIN_NAME`
- `BOOTSTRAP_SUPERADMIN_EMAIL`
- `BOOTSTRAP_SUPERADMIN_PHONE`
- `BOOTSTRAP_SUPERADMIN_PASSWORD`

These values must never be exposed to the frontend or committed to Git.

Once a SuperAdmin exists, subsequent company registrations do not create another SuperAdmin.

## Security

- Registration is rate limited to 5 attempts per IP per hour.
- Company slugs are unique.
- Administrator emails are unique.
- Administrator phones require exactly 10 digits.
- Administrator passwords require 12+ characters, an uppercase letter and a number.
- The first Admin is created inside the new tenant context.
- The returned JWT contains the tenant ID.
- Subscription records have independent lifecycle state and trial dates.

## Validation

```bash
cd server
npm run check:public-onboarding
npm run check:models
npm run check:controllers
npm run check:multitenancy
npm run check:multitenancy:code
```

Do not execute the public registration endpoint against production during CI because it creates real tenant and privileged-account records.
