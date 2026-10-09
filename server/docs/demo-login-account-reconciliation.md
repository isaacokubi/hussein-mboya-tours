# Demo login account reconciliation

This migration aligns the existing demo tenant login records with the canonical 37-account test matrix used by `scripts/verifyDemoApi.js`.

## What it changes

- Keeps the three existing tenant records and their ObjectIds.
- Renames the legacy global account to `superadmin1@husseinmboya.com` and keeps it tenantless with the `super_admin` role.
- Renames the existing tenant users to the canonical `@husseinmboya.com`, `@amanitrails.com`, and `@demosafari.com` login addresses.
- Adds the missing agent 2, guide 2, and driver 2 accounts for each tenant.
- Resets the 37 canonical accounts to the password supplied through `SEED_DEMO_PASSWORD`, and clears login lock counters.
- Updates email fields on linked Staff, Agent, and Customer records by the existing User ObjectId.
- Ensures missing Staff/Agent/Customer support records exist where applicable.
- Does not delete tenants or bookings, tours, payments, accounting records, or other tenant business data.

The migration is idempotent for the canonical account plan. If both a legacy and canonical account exist with different ObjectIds, it stops rather than guessing which identity to keep.

## Safety requirements

The script only accepts the explicitly configured demo Atlas target `cluster0.cdtxzts.mongodb.net/husseindb`. It refuses `NODE_ENV=production`, requires `ALLOW_ATLAS_DEMO_SEED=YES`, and requires `CONFIRM_DEMO_ACCOUNT_MIGRATION=YES` for writes. The password is read from the environment and must not be committed or placed directly in a command history.

Before applying the migration, take a database snapshot/backup using your normal Atlas process. Run the dry-run first and review the full plan. The script intentionally does not run the full comprehensive demo seed, because that seed clears tenant-scoped demo fixtures before recreating them.

## Run from the server directory

Ensure `server/.env` contains the correct `MONGODB_URI` for the demo Atlas database. Enter the password without echoing it:

```bash
cd server
read -rsp "Demo account password: " SEED_DEMO_PASSWORD
printf '\\n'
export SEED_DEMO_PASSWORD
export ALLOW_ATLAS_DEMO_SEED=YES

npm run reconcile:demo-logins -- --dry-run
```

Review the output and make sure the three expected tenant slugs and 37 canonical addresses are shown. After creating a database backup and approving the plan, apply it:

```bash
CONFIRM_DEMO_ACCOUNT_MIGRATION=YES npm run reconcile:demo-logins
```

Then run local checks:

```bash
npm run check:seeds
node --test tests/demoLoginAccountMigration.test.js
```

For a live API verification, use the existing validator only after the migration has completed and the target API is configured:

```bash
DEMO_API_BASE_URL=https://hussein-mboya-tours.onrender.com \\
DEMO_TEST_PASSWORD="$SEED_DEMO_PASSWORD" \\
npm run verify:demo-api
```

The live validator can take several minutes because it intentionally respects login rate limits. Do not run repeated login attempts to work around rate limiting.
