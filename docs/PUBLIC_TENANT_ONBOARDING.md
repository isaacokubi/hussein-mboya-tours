# Public Tenant Onboarding

## Company registration

Open `/register?company=1` to create a company tenant. The first Administrator is created inside that tenant, a 14-day trial subscription is provisioned, and the new Administrator receives a tenant-scoped session.

## First platform SuperAdmin setup

For the first installation, use `/register?company=1&platformSetup=1`.

The form accepts Platform Owner name, email, phone and password, but the browser is not trusted to choose platform credentials. During the one-time first-SuperAdmin window, the backend requires the submitted values to exactly match these private server variables:

```dotenv
BOOTSTRAP_SUPERADMIN_NAME="Platform Owner"
BOOTSTRAP_SUPERADMIN_EMAIL="platform-admin@example.com"
BOOTSTRAP_SUPERADMIN_PHONE="0712345678"
BOOTSTRAP_SUPERADMIN_PASSWORD="use-a-private-strong-password"
```

Do not commit these values to Git or expose them through `VITE_*` variables. After a SuperAdmin exists, later company registrations cannot create another SuperAdmin.

## Trial plans

- Starter: 5 seats, 14 days
- Professional: 15 seats, 14 days
- Business: 50 seats, 14 days
- Enterprise: 250 seats, 14 days

## API

`POST /api/public/onboarding/register`

Normal company registration sends company, plan and first-admin details. First platform setup additionally sends a `bootstrapSuperAdmin` object. The server validates it against the private environment configuration and never returns the platform password.

## Security

- Company registration is rate limited.
- Company slugs and administrator emails are unique.
- Administrator passwords are validated server-side.
- Tenant data is created within tenant context.
- SuperAdmin creation is restricted to the one-time bootstrap path.
- Submitted platform credentials must exactly match backend configuration.
- Platform credentials are never returned to the client.

## Validation

```bash
cd server
npm run check:public-onboarding
npm run check:models
npm run check:controllers
npm run check:multitenancy
npm run check:multitenancy:code
```

Do not invoke live public registration during CI because it creates real tenant and privileged-account records.
