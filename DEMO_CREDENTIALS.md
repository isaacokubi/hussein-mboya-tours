# Demo accounts

The controlled demo seed creates accounts for the `hussein-mboya`, `amani-trails`, and `demo-safari` tenants. Each tenant has an administrator, manager, agent, guide, driver, and four customers. Demo login email addresses use the tenant slug as the domain, for example `admin@hussein-mboya.com` and `customer1@hussein-mboya.com`.

The seed password is supplied privately through `SEED_DEMO_PASSWORD` when running the reset command. It is deliberately not stored in this repository. Use the same environment value for each demo account; do not paste credentials into documentation, issues, or public deployments.

| Role | Login address | Dashboard |
|---|---|---|
| Tenant administrator | `admin@tenant-slug.com` | `/admin` |
| Tour manager | `manager@tenant-slug.com` | `/tour-manager` |
| Agent | `agent@tenant-slug.com` | `/agent` |
| Guide | `guide1@tenant-slug.com` | `/guide` |
| Driver | `driver1@tenant-slug.com` | `/driver` |
| Customer | `customer1@tenant-slug.com` through `customer4@tenant-slug.com` | `/dashboard` |
