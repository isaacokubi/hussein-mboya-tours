# First SuperAdmin and First Company Admin Onboarding

## Purpose

Hussein Mboya Tours uses two privileged levels:

- **SuperAdmin** — platform-level administrator. It is not assigned to a company tenant.
- **Admin** — company-level administrator. Every Admin must belong to exactly one company/tenant.

Public registration creates **customer accounts only**. It cannot create an Admin or SuperAdmin.

## First installation

From `server/` run:

```bash
npm run bootstrap:first
```

The command interactively collects:

1. Company name and slug
2. Country, timezone and currency
3. SuperAdmin name, email, phone and password
4. First company Admin name, email, phone and password

Passwords are entered interactively instead of being placed in shell history.

### Password policy

Both privileged accounts require:

- at least 12 characters
- at least one uppercase letter
- at least one number

The SuperAdmin and first Admin must use different email addresses.

## What bootstrap creates

The one-time bootstrap operation creates:

1. Required system permissions
2. The `superadmin` system role
3. The `admin` system role
4. The first company/Organization
5. The first platform SuperAdmin
6. The first company Admin with the new company's `tenantId`

The company starts on the existing 14-day starter trial configuration.

## One-time protection

Bootstrap checks for an existing active/non-blocked SuperAdmin before doing any work. If one exists, the command refuses to continue:

```text
Initial SuperAdmin already exists. Bootstrap is permanently closed.
```

This prevents a second bootstrap from silently replacing an existing platform administrator.

## After bootstrap

### SuperAdmin

Log in with the SuperAdmin account and:

- change the temporary password if required
- review the company in **SuperAdmin → Tenants**
- manage company lifecycle and platform settings
- create additional companies/tenants

### Company Admin

Log in with the first Admin account and:

- configure company settings
- manage tours, bookings, customers and staff
- create additional Admin/Manager/Agent/Guide/Driver accounts
- manage company roles and permissions according to the existing RBAC rules

When a SuperAdmin creates staff for a company, the request must include a valid tenant/company context. A staff account cannot be created without tenant context.

## Additional companies

After the platform has a SuperAdmin, use the authenticated SuperAdmin tenant-management API/UI to create another company. A first Admin may be supplied as part of tenant creation.

The API is exposed under:

```text
POST /api/tenants
```

Example request shape:

```json
{
  "name": "Example Safaris Ltd",
  "slug": "example-safaris",
  "country": "Kenya",
  "timezone": "Africa/Nairobi",
  "currency": "KES",
  "admin": {
    "name": "Company Administrator",
    "email": "admin@example.com",
    "phone": "0712345678",
    "password": "Use-A-Strong-Password1"
  }
}
```

The API validates the administrator, refuses duplicate email addresses, creates the company Admin inside the new tenant context, and returns a safe user representation without the password.

## Security model

- `superadmin` is platform-wide and is created only through the one-time bootstrap process.
- `admin` is tenant-scoped.
- The normal registration endpoint always creates `customer` users.
- Staff creation requires tenant context.
- SuperAdmin accounts cannot be created through the normal staff-management endpoint.
- Cross-tenant access continues to be enforced by the existing tenant context and tenant isolation plugin.

## Validation

Run:

```bash
npm run check:onboarding
npm run check:rbac
npm run check:multitenancy
npm run check:multitenancy:code
npm run check:all
```

For the live tenant regression suite:

```bash
npm run check:multitenancy:live
```

Do **not** run `npm run bootstrap:first` against a production database unless this is the first installation and you have verified that no SuperAdmin exists.
