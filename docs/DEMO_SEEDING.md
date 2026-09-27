# Demo Data & Seed Runbook

## Purpose and safety boundary

This runbook describes the repository's controlled synthetic demo dataset and reset process. The reset is destructive to non-owner application data in the selected database.

Only run it against a database independently established and explicitly authorized as disposable demo/staging data. The `husseindb` target used for the 2026-09-27 run was explicitly authorized as demo/staging for that task. That authorization does not apply to a future production database. Production was not provided or accessed.

Before a future run, verify the effective `MONGODB_URI` database path and environment. Do not use an unknown database, another cluster/database, or real production/customer data. The script now refuses a host or database other than its configured demo Atlas target. It preserves platform-owner accounts and existing tenant identities, but deletes other application collection data.

## Latest verified demo seed — 2026-09-27

Connected target: Atlas database `husseindb` on `cluster0.cdtxzts.mongodb.net`.

| Record type | Actual count |
|---|---:|
| Tenants / organizations | 3 |
| Users, including platform owner | 19 |
| Roles | 18 |
| Global permissions | 25 |
| Staff / agents / customers | 6 / 3 / 3 |
| Tours / tour packages | 12 / 12 |
| Destinations | 12 |
| Bookings / payments / commissions | 36 / 30 / 36 |
| Reviews / wishlists / notifications | 9 / 0 / 18 |
| Vehicles / leads | 3 / 6 |
| Suppliers / invoices / expenses | 6 / 36 / 6 |
| Purchase orders / tour costs / supplier payables | 6 / 6 / 6 |
| Journal entries / chart-of-account records | 63 / 105 |
| Credit/debit notes / corporate accounts | 6 / 6 |
| Compliance / privacy / travel-service records | 24 / 9 / 18 |
| Website integration keys / events | 3 / 9 |
| Payment gateway configurations | 12 |
| Demo API keys / webhooks | 3 / 3 |
| Accommodation inventory | 18 |
| Hotels / room types / rate plans / hotel bookings | 6 / 12 / 12 / 12 |
| Airport-transfer products / bookings | 9 / 12 |
| Subscriptions / subscription payments | 0 / 0 |
| Campaigns / hero slides / galleries / tour galleries / tour reports | 0 / 0 / 0 / 0 / 0 |

All other collections were also counted; any collection omitted from the table has zero documents. The expected tenant slugs are `hussein-mboya`, `amani-trails`, and `demo-safari`. The existing tenant IDs were retained. One tenantless `super_admin` platform-owner account was preserved.

Each tenant has six demo role users (`admin`, `tour_manager`, `guide`, `driver`, `agent`, `customer`) linked to six roles. Each role references 25 permissions. All audited tenant-scoped records had a `tenantId`. Live tenant-isolation regression passed 17/17 checks.

Featured images are unique for **12/12 tours** and **12/12 destinations**. Destination images use local `client/public/demo-destinations/kenya-landscape-01.svg` through `-12.svg`; tour image references use 12 distinct catalogued Unsplash IDs. This reset creates 12 tours and 12 destinations; the previous 24-tour/36-destination dataset is not the output of this reset script.

All 30 payment rows are synthetic demo fixtures with `DEMO-` transaction references. The seed stages contain no live Daraja/STK, payment, refund-provider, or external-payment invocation. **No live M-Pesa transaction was initiated.**

## Verification for this run

- Backend suite: **181 passed, 0 failed, 5 skipped**.
- `npm run check:all`: **PASS**.
- Frontend `npm run lint`: **PASS**.
- Frontend `npm run build`: **PASS**.
- Live tenant isolation: **17 passed, 0 failed**.
- RBAC role links and permission assignments: **PASS**.
- Atlas readiness pair: not run because its configured URIs target `global_tours_test`, outside the task's explicit authorization to touch only `husseindb`.
- No leftover temporary isolation-test tenants remained.

The initial full seed stopped in finance on a duplicate synthetic payment caused by the booking post-save ledger hook. The hook now skips automatic payment-ledger synchronization when `DEMO_SEED_MODE=true`. Finance was resumed against only tenant-scoped transactional collections; the full destructive reset was not repeated. Operations and hospitality stages then completed.

These are demo/staging results. They do not establish readiness or certification for the separate production database.

## Supported seed entry point

Run from the repository root:

```bash
cd server
CONFIRM_DEMO_RESET=YES SEED_DEMO_PASSWORD='YOUR_DEMO_PASSWORD' npm run seed:demo
```

The command requires `CONFIRM_DEMO_RESET=YES`, a `SEED_DEMO_PASSWORD` of at least eight characters, and the exact configured demo Atlas host/database. Never print or commit the seed password. The script enables `DEMO_SEED_MODE=true`, preserves tenant identities and platform-owner accounts, resets non-owner application data, and then runs financial master data, accounting/finance, dashboard operations/website integration, and hospitality/hotel/airport-transfer seed stages.

After seeding, verify the actual database counts, tenant IDs, role assignments, image uniqueness, and synthetic payment references. Run `npm test`, `npm run check:all`, then frontend `npm run lint` and `npm run build`. The seed is not evidence of a successful live payment, refund, provider callback, KRA/eTIMS submission, SMTP delivery, production backup/restore, or production deployment.
