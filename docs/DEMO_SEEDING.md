# Demo Data and Seed Runbook

## Safety and reset process

The authoritative comprehensive seed is `server/seeds/completeTestDemoSeed.js`. The compatibility `seed:demo` command delegates to it and does not maintain another user list. The comprehensive seed is restricted to a disposable database. **Never run it against `husseindb` or the live application database.** For Atlas, the only allowed target is the dedicated `global_tours_test` database on `cluster0.cdtxzts.mongodb.net`, with explicit opt-in. It requires `ALLOW_ATLAS_DEMO_SEED=YES`, `CONFIRM_TEST_SEED=YES`, a private `SEED_DEMO_PASSWORD`, and `NODE_ENV=test`. It validates the exact Atlas host/database, exact tenant slugs/names, and unsafe fallback settings before writing. Before replacing records scoped to the three demo tenant IDs, it writes `server/reports/test-seed-preflight-report.json` with tenant identities and planned per-model deletion counts. It does not drop the database or touch other tenant IDs.

Create a **local-only** `server/.env.seed-staging` file (never commit it) containing the staging MongoDB URI and these values. Keep the database password private:

```dotenv
NODE_ENV=test
MONGODB_URI=mongodb+srv://<staging-user>:<staging-password>@cluster0.cdtxzts.mongodb.net/global_tours_test?retryWrites=true&w=majority
ALLOW_ATLAS_DEMO_SEED=YES
CONFIRM_TEST_SEED=YES
SEED_DEMO_PASSWORD=<private-disposable-account-password>
CLIENT_URL=
CLIENT_ORIGINS=
PLATFORM_HOST=
RENDER_EXTERNAL_HOSTNAME=
```

Run from the `server` directory:

```bash
node --env-file=.env.seed-staging seeds/completeTestDemoSeed.js
```

Review the preflight report and final per-tenant counts before using the staging data. Do not paste database URIs or passwords into chat or commit the environment file.

Never place the seed password in source, documentation, public environment files, or Git. The user model hashes it with the existing bcrypt save hook.

## Historical demo dataset — 2026-09-28 (28-user seed)

Connected target: Atlas database `husseindb` on `cluster0.cdtxzts.mongodb.net`.

| Record type | Count |
|---|---:|
| Tenants / users (including preserved platform owner) | 3 / 28 |
| Tenant roles / global permissions | 18 / 25 |
| Staff / agents / customers | 7 / 3 / 12 |
| Destinations / tours / tour packages | 36 / 36 / 36 |
| Bookings / payments / commissions / invoices | 36 / 30 / 36 / 36 |
| Enquiries / custom-tour modification requests / quotations | 6 / 6 / 6 |
| Reviews / wishlists / notifications | 9 / 0 / 61 |
| Vehicles / leads | 3 / 6 |
| Suppliers / expenses / purchase orders / tour costs / supplier payables | 6 / 6 / 6 / 6 / 6 |
| Journal entries / chart-of-account records | 63 / 105 |
| Credit/debit notes / corporate accounts | 6 / 6 |
| Compliance / privacy / travel-service records | 24 / 9 / 18 |
| Website integration keys / events | 3 / 9 |
| Payment gateway configurations / demo API keys / webhooks | 12 / 3 / 3 |
| Accommodation inventory | 18 |
| Hotels / room types / rate plans / hotel bookings | 7 / 14 / 12 / 12 |
| Airport-transfer products / bookings | 9 / 12 |
| Hospitality room blocks / deposits / operational assets | 0 / 0 / 0 (not seeded in this fixture) |

This record predates the authoritative 37-account architecture and is retained as historical evidence only. It does not establish the current database counts or current account set. The current intended architecture is one global superadmin plus 12 users per tenant, as listed in [Demo accounts](../DEMO_CREDENTIALS.md). Each tenant has 12 published destinations and 12 public tours in the historical validation.

The accepted demo quotation for each tenant points to a booking in that same tenant. Finance records, bookings, payments, and supplier costs are synthetic. The seed does not initiate live M-Pesa, Stripe, refund-provider, or other external payment actions.

The current Atlas records were reconciled from their linked booking, payment, review, tour, and destination rows. Every tenant has 12 bookings and 10 payments; review records now point to completed bookings, booking balances match net payments, tour availability and review counters match source rows, and destination catalogue counters match their tours. Public tours and destinations returned 12 tenant-matched records for each tenant after reconciliation.

### Follow-up live verification — 2026-09-29

The read-only application audit again found 92 physical collections in `husseindb`, with the three established tenants and 1 platform owner. There are 14 room types: 6 belong to Hussein Mboya Tours and 4 each to Amani Trails Safaris and Demo Safari Adventures. All 14 use unique `(tenant, hotel, name)` keys and reference an existing hotel in their own tenant. The current reset seed defines 12 room types; the two additional Hussein Mboya room types (`Ocean View` and `Deluxe Tent`) are valid references, but their origin is not established by the current reset seed. No data was changed. Live counts also show 7 hotels, 7 Staff records, and 61 notifications, compared with the previously documented 6, 6, and 48. All assigned guide/driver references resolve to Staff records in the same tenant. Airport-transfer bookings remain 12 total (4 per tenant). The other counts in the inventory table match the read-only count query.

## Deployment diagnosis and verification

The deployed Vercel bundle uses `https://hussein-mboya-tours.onrender.com/api` and carries the explicit `hussein-mboya` public tenant selector. Render health reported `database=connected` and `databaseName=husseindb`. CORS preflight from `https://hussein-mboya-tours.vercel.app` allowed the origin and `X-Tenant-Slug`. Before seeding, the public routes correctly returned `404 Tenant not found` because the configured database had no tenant records. After creating the tenants and catalogue, the public destination and tour routes returned HTTP 200 with 12 results each. This was a missing tenant/data problem, not a frontend fallback or API URL issue.

The 2026-09-29 live deployment check distinguished the two frontend aliases. `https://hussein-mboya-tours.vercel.app` still serves the API above; its health endpoint reports `husseindb`, and its tour and destination endpoints each return 12 records. Its CORS preflight is allowed. `https://hussein-mboya-tours-2.vercel.app` serves a different bundle configured for `https://hussein-mboya-tours-1.onrender.com/api`. That API reported `databaseName=global_tours_test`, returned HTTP 503 for catalogue routes, and did not allow the `-2` Vercel origin at the canonical API. It is **not connected to the seeded `husseindb` experience**. Vercel settings were not changed.

Validation completed for this run:

- `npm run check:seeds` and the targeted demo-seed safety/readiness tests passed.
- The frontend production build passed with the deployed Render API and socket origins.
- Live destination and tour API checks returned 12 records each.
- Live admin, manager, agent, guide, driver, customer, and platform-owner logins succeeded in the API smoke check; customer access to admin endpoints was denied, and two tenant customer accounts resolved to distinct tenant IDs.
- Atlas read-only checks confirmed per-tenant counts and converted quotation-to-booking references.

The full test suite, production certification, and live payment/refund flows were not part of this run. Demo seed output is not evidence of production readiness.
