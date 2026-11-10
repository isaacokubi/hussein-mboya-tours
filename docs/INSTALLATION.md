# Installation and development setup

## Requirements

- Node.js version compatible with project dependencies (repository does not pin an exact Node version in a root tool-version file).
- npm.
- MongoDB accessible from the API; the configured URI must select a safe development database.
- Optional provider accounts/credentials for M-Pesa, Stripe, PayPal, AI, email, SMS, WhatsApp and Cloudinary features.

## Backend

```bash
cd server
npm ci
cp .env.example .env
```

Set at least `MONGODB_URI` and a strong random `JWT_SECRET` in `server/.env`. Use local development values and a development database; do not use production connection strings. Set `CLIENT_ORIGINS=http://localhost:5173` for the local Vite origin. The sample uses safe placeholders and is not a provider credential source.

Start the API:

```bash
npm run dev
```

The backend listens on `PORT` (default 5000). Check `http://localhost:5000/api/live`, then `http://localhost:5000/api/health` for database readiness.

## Frontend

In another shell:

```bash
cd client
npm ci
```

Local Vite development defaults to the local API proxy in `client/src/api/axios.js`/Vite configuration. If a specific API URL is required, set `VITE_API_URL` to the `/api` base; production builds validate HTTPS and path requirements. Then:

```bash
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`). To build locally use `npm run build`; `npm run preview` serves that build.

## Database and sample data

Mongoose schemas/indexes are loaded by the application. Startup connects MongoDB and runs configured startup work. Seeds exist under `server/seeds/` and `server/scripts/`; many reset, repair, or create credentials and require flags. Read the exact script and use an isolated throwaway database before running one. Never seed a production database casually. There is no claim here that every seed is required for app startup.

## Common setup errors

- **Missing env config:** server validates required variables on import/startup; compare with `server/.env.example`.
- **Mongo unavailable:** confirm URI, network allowlist, database name and local service; `/api/live` can respond while `/api/health` reports not ready.
- **CORS blocked:** set exact browser origin in `CLIENT_ORIGINS` and restart API.
- **Frontend hits wrong API:** inspect `VITE_API_URL`, Vite proxy, browser network tab and `client/src/api/axios.js`.
- **Production build rejects URL:** production API URL must be absolute HTTPS ending in `/api` exactly once.
- **Provider route unavailable:** confirm tenant payment-method enablement and encrypted credentials; API availability does not prove payment provider operation.

For variable details see [environment variables](ENVIRONMENT_VARIABLES.md); for the exact scripts see the two package manifests.
