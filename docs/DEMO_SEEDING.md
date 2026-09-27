# Demo Seeding Verification

## 2026-09-27 controlled reset

The guarded `npm run seed:demo` reset targeted the authorized demo/staging Atlas database `husseindb` on `cluster0.cdtxzts.mongodb.net`. No other MongoDB database was used. The separate production database has not been provided and was not accessed.

The reset preserved the tenant identities and one platform-owner account. It replaced application data in the authorized database, then completed the finance, dashboard operations/website-integration, hospitality, hotel, and airport-transfer seed stages. The finance stage first stopped on duplicate synthetic payments caused by the booking post-save ledger hook. The hook now defers automatic payment-ledger synchronization while `DEMO_SEED_MODE=true`; finance was resumed against only tenant-scoped transactional collections, without repeating the reset. The reset command now requires the exact demo Atlas host and database name.

### Tenants and access

| Tenant | Slug | ID |
|---|---|---|
| Hussein Mboya Tours | `hussein-mboya` | `6ab911b18f2f66ee603c3a7f` |
| Amani Trails Safaris | `amani-trails` | `6ab913528f2f66ee603c3aa8` |
| Demo Safari Adventures | `demo-safari` | `6ab913ae8f2f66ee603c3acd` |

The platform owner remains a tenantless `super_admin` with a password hash present. Each tenant has six demo role users (`admin`, `tour_manager`, `guide`, `driver`, `agent`, `customer`), six roles, two staff, one agent, and one customer. Every role references 25 permissions. The live tenant-isolation regression passed 17/17 checks, and all audited tenant-scoped records had a tenant ID.

### Actual final counts

| Record type | Count |
|---|---:|
| Organizations / tenants | 3 |
| Users, including platform owner | 19 |
| Roles | 18 |
| Global permissions | 25 |
| Staff | 6 |
| Agents | 3 |
| Customers | 3 |
| Destinations | 12 |
| Tours | 12 |
| Tour packages | 12 |
| Bookings | 36 |
| Payments | 30 |
| Commissions | 36 |
| Reviews | 9 |
| Notifications | 18 |
| Wishlists | 0 |
| Vehicles | 3 |
| Leads | 6 |
| Suppliers | 6 |
| Invoices | 36 |
| Expenses | 6 |
| Purchase orders | 6 |
| Tour costs | 6 |
| Supplier payables | 6 |
| Journal entries | 63 |
| Chart-of-account records | 105 |
| Credit/debit notes | 6 |
| Corporate accounts | 6 |
| Compliance records | 24 |
| Privacy requests | 9 |
| Travel service requests | 18 |
| Website integration keys / events | 3 / 9 |
| Payment gateway configurations | 12 |
| Demo API keys / webhooks | 3 / 3 |
| Accommodation inventory | 18 |
| Hotels / room types / rate plans | 6 / 12 / 12 |
| Hotel bookings | 12 |
| Airport-transfer products / bookings | 9 / 12 |
| Subscriptions / subscription payments | 0 / 0 |
| Campaigns / hero slides / galleries / tour galleries | 0 / 0 / 0 / 0 |
| Tour reports | 0 |

Every database collection not otherwise listed in the count table has zero records. This includes travel-commercial rules/reports, webhook deliveries, background jobs, media, payment links, AI conversations/tasks, referrals, hospitality room blocks/deposits/supplier contracts, finance budgets, hero slides, preferences, system settings, subledgers, operational assets, backups, withholding taxes, refunds/refund audits, invoice sequences, quotations, security/audit logs, promotions, tax rules, coupons, subscription payments, galleries, tax profiles, fixed assets, loyalty data, staff profiles, accounting periods/reconciliations, custom tour requests, eTIMS submissions/credentials, tour categories, and itineraries.

### Images and payment safety

Featured images are unique for **12/12 tours** and **12/12 destinations**. Destination image references use local `/demo-destinations/kenya-landscape-01.svg` through `-12.svg` assets; tour image references use 12 distinct catalogued Unsplash IDs. This reset creates 12 tours and 12 destinations, so its image totals differ from the older 24-tour/36-destination baseline.

All 30 payment rows are synthetic demo fixtures with `DEMO-` transaction references. The seed stages contain no Daraja/STK, live payment, refund-provider, or external-payment invocation. **No live M-Pesa transaction was initiated.**

### Verification results

- Backend suite: **181 passed, 0 failed, 5 skipped**. Skips are database-integration cases requiring additional opt-in configuration.
- `npm run check:all`: **PASS**.
- Frontend `npm run lint`: **PASS**.
- Frontend `npm run build`: **PASS**.
- Live tenant isolation: **17 passed, 0 failed**.
- RBAC: **PASS** for seeded user-role links and permission assignments.
- Atlas readiness integration pair: not run because configured URIs target `global_tours_test`, outside this task's authorization to touch only `husseindb`.

These are demo/staging results. They do not certify the separate production database, which has not been provided or accessed.
