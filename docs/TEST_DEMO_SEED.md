# Disposable TEST/DEMO database seed

`npm run seed:test:complete` creates or updates deterministic Global Tours test fixtures in a disposable MongoDB database. It requires MongoDB 4.2 or later; the application's supported CI target is MongoDB 8. The configured database must have an explicitly test, demo, disposable, or seed-namespaced database name.

Run only after starting a disposable local MongoDB instance, with no production credentials in its URI:

```sh
read -rs -p "Disposable TEST seed password: " TEST_DEMO_SEED_PASSWORD
printf '\n'
export TEST_DEMO_SEED_PASSWORD
cd server
MONGODB_URI='mongodb://127.0.0.1:27017/global_tours_test' CONFIRM_TEST_SEED=YES NODE_ENV=development PLATFORM_HOST=localhost CLIENT_URL=http://localhost CLIENT_ORIGINS=http://localhost ALLOW_GLOBAL_MPESA_FALLBACK=false ALLOW_SINGLE_TENANT_DEV_FALLBACK=false npm run seed:test:complete
unset TEST_DEMO_SEED_PASSWORD
```

The command independently checks `NODE_ENV`, the database name, production-looking host and deployment settings, both unsafe M-Pesa fallback flags, and the connected MongoDB server version before writing. It prints the database name only. Do not change the guard to make a non-disposable database pass.

Before running, provide `TEST_DEMO_SEED_PASSWORD` through the operator's environment. The value must be at least 12 characters and is never stored in this repository or written to the JSON report. Use it only for local disposable test accounts, never for real accounts or production credentials.

No payment provider, M-Pesa endpoint, webhook, or KRA/eTIMS service is contacted. Synthetic payment, invoice, tax, and regulatory states are not real transactions, submissions, registrations, or certifications. The seed is idempotent and only upserts its stable namespace records; it does not wipe arbitrary data.

The current configured database is not a disposable test database, so this repository's present configuration is expected to be refused. A compatible disposable local MongoDB instance must be provided before actual database seeding and database-backed fixture validation can be completed.
