# Project presentation

Adapt first-person descriptions to work you personally performed. Repository code supports the technical statements below; it does not prove every feature was personally authored or used in production.

## 30 seconds

“I’ve been working with Hussein Mboya Tours, a React and Express travel-booking application. Customers can discover tours and make reservations, while role-based dashboards support staff operations. The backend uses MongoDB through Mongoose and includes tenant scoping, authentication, booking workflows and payment integrations such as M-Pesa. I’ve been documenting the implementation and its readiness limits carefully, especially where code exists but an external payment lifecycle still needs verification.”

## One minute

“Hussein Mboya Tours connects a customer-facing travel website with operational tools. The browser is a React SPA that calls an Express API. The API routes requests through tenant resolution and authentication/permission middleware, then controllers and services work with Mongoose models in MongoDB. The source covers catalog discovery, bookings, custom tours, staff assignment, hospitality reservations, and finance modules. Payment code supports M-Pesa STK Push and has Stripe/PayPal paths. A provider accepting a request is not the same as a confirmed payment, so payment lifecycle state is persisted and verified asynchronously. Render and Vercel configuration are present, though a config file alone is not proof of a live deployment.”

## Three minutes

“The system has a React/Vite frontend and Node/Express API. React Router separates public browsing and customer workflows from admin, agent, guide, driver, tour-manager and platform-admin dashboards. TanStack Query handles remote state, and API modules centralize Axios calls.

“On the backend, `server.js` starts HTTP/Socket.IO and then initializes MongoDB, readiness, migrations and background work. `app.js` applies request context, security headers, CORS, rate limits, parsers, tenant resolution and routes in a deliberate order. Route modules compose guards and validators; controllers coordinate requests; services hold reusable business and provider logic; Mongoose schemas define the records and indexes.

“Tenant isolation is a central concern. The request host/headers resolve a tenant, authenticated users are checked against their assigned tenant, and query helpers/plugins scope many model operations. I would always review raw aggregations and background jobs separately.

“A booking starts in the customer UI and reaches a protected booking route. The backend validates tour or approved custom-tour data, date and capacity, calculates amounts server-side and persists the booking. For M-Pesa, the API validates the outstanding balance and phone, initiates Daraja STK Push, persists an attempt and waits for callback/query verification. The browser polls the persisted state. That distinction avoids treating an accepted prompt as settled funds.

“The repository has Render and Vercel configuration plus a substantial test suite. I distinguish unit/mock evidence from live provider and production evidence. If I extended the project, I’d prioritize full OpenAPI contracts, tenant-isolation tests across all query patterns, sandbox lifecycle evidence and production observability.”

## Five-minute technical presentation

Use the three-minute narrative, then demonstrate:

1. `client/src/routes/AppRoutes.jsx`: show public and protected route groups and lazy loading.
2. `client/src/api/bookingApi.js`: show the thin transport wrapper and shared Axios.
3. `server/routes/bookingRoutes.js`: trace authentication, customer role and travel-date validation.
4. `server/controllers/customerBookingController.js` and `services/bookingCreationService.js`: explain server-side rules and transaction boundary.
5. `server/models/Booking.js`: show tenant reference, booking/payment state, validation and indexes.
6. `server/routes/mpesaRoutes.js`, `controllers/mpesaController.js`, `services/mpesaService.js`: explain provider request versus verified payment.
7. `server/middleware/authMiddleware.js`: show JWT reload, tenant check, role/permission flow.
8. `server/server.js` and deployment manifests: explain readiness/background startup and configured hosting shape.

## HR / nontechnical version

“It is a travel business web platform intended to make it easier for customers to find trips and reserve them, and for staff to coordinate what happens after a reservation. It brings booking information and operations into one application. I focus on explaining what the code demonstrably does and what still needs real-world verification.”

## Engineering interviewer version

“This is a React/Vite SPA backed by an Express 5 API and MongoDB/Mongoose. Tenant resolution and auth middleware precede route/controller/service/model work. The customer booking controller validates server-side pricing and capacity, reserves slots and compensates if insertion fails; a separate booking creation helper uses a Mongo transaction, but this controller does not call it. Payments use provider adapters; M-Pesa has token, STK, callback, query and lifecycle code, but final payment state depends on verified provider evidence. Production configs exist for Render/Vercel, while live deployment and end-to-end provider certification must be substantiated separately.”
