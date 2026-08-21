# Public Tenant Onboarding

## Company registration

Open `/register?company=1` to create a company tenant. The first Administrator is created inside that tenant, a 14-day trial subscription is provisioned, and the new Administrator receives a tenant-scoped session.

## First platform SuperAdmin

The platform SuperAdmin is a global account and must never be freely selectable by an arbitrary public registrant. Configure the first platform identity privately on the backend:

```dotenv
BOOTSTRAP_SUPERADMIN_NAME="Platform Owner"
BOOTSTRAP_SUPERADMIN_EMAIL="platform-admin@example.com"
BOOTSTRAP_SUPERADMIN_PHONE="0712345678"
BOOTSTRAP_SUPERADMIN_PASSWORD="use-a-private-strong-password"
```

These values must never be committed to Git or exposed through `VITE_*` variables.

The onboarding service creates the first SuperAdmin only when no SuperAdmin exists and the backend bootstrap configuration is present. Subsequent company registrations do not create additional SuperAdmins.

## Trial plans

- Starter: 5 seats, 14 days
- Professional: 15 seats, 14 days
- Business: 50 seats, 14 days
- Enterprise: 250 seats, 14 days

## API

`POST /api/public/onboarding/register`

The normal request contains company, plan and first-admin details. First platform setup is controlled by private backend configuration and is never returned in API responses.

## Security

- Company registration is rate limited.
- Company slugs and administrator emails are unique.
- Administrator passwords are validated server-side.
- Tenant data is created within tenant context.
- SuperAdmin creation is restricted to the one-time bootstrap path.
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
