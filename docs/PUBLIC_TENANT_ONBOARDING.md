# Public Tenant Onboarding

## Company registration

Open `/register?company=1` to create a new company tenant. The first Administrator is created inside that tenant and receives a tenant-scoped session. A 14-day trial Subscription is provisioned automatically.

## First platform SuperAdmin setup

For the first installation, use the dedicated setup mode:

`/register?company=1&platformSetup=1`

The company registration form then includes:

- Platform Owner name
- Platform SuperAdmin email
- Platform SuperAdmin phone
- Platform SuperAdmin password
- Platform SuperAdmin password confirmation

The submitted values are **not trusted just because they came from the browser**. During the one-time first-SuperAdmin window, the backend requires the submitted values to exactly match these private server environment variables:

- `BOOTSTRAP_SUPERADMIN_NAME`
- `BOOTSTRAP_SUPERADMIN_EMAIL`
- `BOOTSTRAP_SUPERADMIN_PHONE`
- `BOOTSTRAP_SUPERADMIN_PASSWORD`

After a SuperAdmin exists, the submitted platform fields cannot create another SuperAdmin. No platform credentials are stored in the frontend bundle or repository.

Example backend configuration:

```dotenv
BOOTSTRAP_SUPERADMIN_NAME="Platform Owner"
BOOTSTRAP_SUPERADMIN_EMAIL="platform-admin@example.com"
BOOTSTRAP_SUPERADMIN_PHONE="0712345678"
BOOTSTRAP_SUPERADMIN_PASSWORD="use-a-private-strong-password"
```

Do not commit these values to Git or place them in `VITE_*` variables.

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
  },
  "bootstrapSuperAdmin": {
    "name": "Platform Owner",
    "email": "platform-admin@example.com",
    "phone": "0712345678",
    "password": "..."
  }
}
```

`bootstrapSuperAdmin` is required only when the database has no SuperAdmin and must match the private backend configuration.

## Trial plans

- Starter: 5 seats, 14 days
- Professional: 15 seats, 14 days
- Business: 50 seats, 14 days
- Enterprise: 250 seats, 14 days

## Security

- Registration is rate limited to 5 attempts per IP per hour.
- Company slugs are unique.
- Administrator emails are unique.
- Administrator phones require exactly 10 digits.
- Administrator passwords require 12+ characters, an uppercase letter and a number.
- Platform bootstrap details are accepted only during the first-SuperAdmin window and only when they match backend configuration.
- The first Admin is created inside the new tenant context.
- The returned JWT contains the tenant ID.
- Subscription records have independent lifecycle state and trial dates.
- Platform passwords are never returned in API responses.

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
