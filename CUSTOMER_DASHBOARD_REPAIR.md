# Customer Dashboard Repair

## Root cause found
1. The browser was running on `http://localhost:5173` while the client was configured to call an ngrok API URL.
2. The ngrok API response did not include `Access-Control-Allow-Origin: http://localhost:5173`, so `/api/auth/me` and `/api/bookings/my-bookings` were blocked by the browser.
3. React Query was also passing its `QueryFunctionContext` directly into `getMyBookings`, producing query parameters such as `[object Object]`, `[object Object]`, and `AbortSignal`.

## Repairs
- `client/src/api/axios.js`
  - Uses `http://localhost:5000/api` automatically when the app is opened on localhost and the configured URL is empty or an ngrok URL.
  - Keeps explicit production/staging API URLs for non-local browsers.
- `client/.env.local`
  - Sets the local API and socket URLs.
- `client/src/pages/Dashboard.jsx`
  - Uses `queryFn: () => getMyBookings()` so React Query context is not serialized into the request.
- `client/src/api/bookingApi.js`
  - Defensively rejects QueryFunctionContext objects as request parameters.
- `server/app.js`
  - Always permits localhost development origins in addition to configured origins.
- `client/.env.example` and `server/.env.example`
  - Added clear environment templates.

## Run after extracting
```bash
cd client
npm install
npm run dev
```

In another terminal:
```bash
cd server
npm install
npm run dev
```

Then open:
`http://localhost:5173/login`

After logging in, the customer dashboard should call:
`http://localhost:5000/api/auth/me`
and
`http://localhost:5000/api/bookings/my-bookings`

If you intentionally want to use the ngrok backend instead of the local server, its server environment must explicitly include:
`CLIENT_ORIGINS=http://localhost:5173`
and the ngrok backend must be restarted/redeployed.
