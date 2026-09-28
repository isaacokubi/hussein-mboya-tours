# Demo Data and Seed Runbook

## Safety and reset process

The reset replaces application records in the selected database. It requires `CONFIRM_DEMO_RESET=YES`, a private `SEED_DEMO_PASSWORD` of at least eight characters, and the exact configured Atlas host and database. The script refuses any target other than `cluster0.cdtxzts.mongodb.net/husseindb`, validates the target before connecting, preserves existing platform-owner accounts, and recreates the three established tenant records. Transient Atlas network failures receive up to two retries; each retry repeats the same guarded reset.

Run from the repository root:

```bash
cd server
CONFIRM_DEMO_RESET=YES SEED_DEMO_PASSWORD='YOUR_PRIVATE_DEMO_PASSWORD' npm run seed:demo
```

Never place the seed password in source, documentation, public environment files, or Git. The user model hashes it with the existing bcrypt save hook.

## Latest verified demo dataset — 2026-09-28

Connected target: Atlas database `husseindb` on `cluster0.cdtxzts.mongodb.net`.

| Record type | Count |
|---|---:|
| Tenants / users (including preserved platform owner) | 3 / 28 |
| Tenant roles / global permissions | 18 / 25 |
| Staff / agents / customers | 6 / 3 / 12 |
| Destinations / tours / tour packages | 36 / 36 / 36 |
| Bookings / payments / commissions / invoices | 36 / 30 / 36 / 36 |
| Enquiries / custom-tour modification requests / quotations | 6 / 6 / 6 |
| Reviews / wishlists / notifications | 9 / 0 / 48 |
| Vehicles / leads | 3 / 6 |
| Suppliers / expenses / purchase orders / tour costs / supplier payables | 6 / 6 / 6 / 6 / 6 |
| Journal entries / chart-of-account records | 63 / 105 |
| Credit/debit notes / corporate accounts | 6 / 6 |
| Compliance / privacy / travel-service records | 24 / 9 / 18 |
| Website integration keys / events | 3 / 9 |
| Payment gateway configurations / demo API keys / webhooks | 12 / 3 / 3 |
| Accommodation inventory | 18 |
| Hotels / room types / rate plans / hotel bookings | 6 / 12 / 12 / 12 |
| Airport-transfer products / bookings | 9 / 12 |
| Hospitality room blocks / deposits / operational assets | 0 / 0 / 0 (not seeded in this fixture) |

Each tenant (`hussein-mboya`, `amani-trails`, `demo-safari`) has nine users: administrator, manager, agent, guide, driver, and four customers. The application does not define a finance or operations login role in its User schema, so the seed does not invent those roles. Each tenant has 12 published destinations and 12 public tours. The public Vercel API checks returned HTTP 200 and 12 results for both catalogues. Every tenant has 12 distinct tour images and 12 distinct destination images; destination artwork is served from the repository's local demo SVG catalogue.

The accepted demo quotation for each tenant points to a booking in that same tenant. Finance records, bookings, payments, and supplier costs are synthetic. The seed does not initiate live M-Pesa, Stripe, refund-provider, or other external payment actions.

The current Atlas records were reconciled from their linked booking, payment, review, tour, and destination rows. Every tenant has 12 bookings and 10 payments; review records now point to completed bookings, booking balances match net payments, tour availability and review counters match source rows, and destination catalogue counters match their tours. Public tours and destinations returned 12 tenant-matched records for each tenant after reconciliation.

## Deployment diagnosis and verification

The deployed Vercel bundle uses `https://hussein-mboya-tours.onrender.com/api` and carries the explicit `hussein-mboya` public tenant selector. Render health reported `database=connected` and `databaseName=husseindb`. CORS preflight from `https://hussein-mboya-tours.vercel.app` allowed the origin and `X-Tenant-Slug`. Before seeding, the public routes correctly returned `404 Tenant not found` because the configured database had no tenant records. After creating the tenants and catalogue, the public destination and tour routes returned HTTP 200 with 12 results each. This was a missing tenant/data problem, not a frontend fallback or API URL issue.

Validation completed for this run:

- `npm run check:seeds` and the targeted demo-seed safety/readiness tests passed.
- The frontend production build passed with the deployed Render API and socket origins.
- Live destination and tour API checks returned 12 records each.
- Live admin, manager, agent, guide, driver, customer, and platform-owner logins succeeded in the API smoke check; customer access to admin endpoints was denied, and two tenant customer accounts resolved to distinct tenant IDs.
- Atlas read-only checks confirmed per-tenant counts and converted quotation-to-booking references.

The full test suite, production certification, and live payment/refund flows were not part of this run. Demo seed output is not evidence of production readiness.
