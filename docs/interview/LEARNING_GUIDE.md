# Learning guide

Follow this sequence and complete the exercise before reading the next layer.

For source excerpts and step-by-step request/data-flow walkthroughs, use the [application learning manual](../LEARNING_MANUAL.md).

## 1. JavaScript modules and async control flow

**Concept:** ES modules import/export code; promises and `async/await` coordinate I/O without blocking Node's event loop. **In this app:** nearly all backend/client source uses ES modules and async API/database calls. **Exercise:** trace a `try/catch` from a controller through an awaited service. **Interview:** what happens when an awaited promise rejects?

## 2. React and React Router

**Concept:** components render UI from props/state; hooks manage local and shared behavior; routes map URL to components. **In this app:** `main.jsx`, `App.jsx`, `routes/AppRoutes.jsx`, pages and domain components. **Exercise:** trace the checkout route and explain loading/error/success states. **Interview:** when would you lift state or create a context?

## 3. TanStack Query and Axios

**Concept:** Axios handles HTTP; a query cache tracks remote data, pending/error state, retries/refetch and invalidation. **In this app:** `client/src/api/` plus `lib/queryClient.js` and query hooks/pages. **Exercise:** find one mutation and explain which query it invalidates. **Interview:** how do you avoid showing stale data after a write?

## 4. Express middleware and routing

**Concept:** middleware runs in order and can respond, alter request, or pass control. **In this app:** `server/app.js`, route modules and auth/tenant guards. **Exercise:** write the middleware sequence for `POST /api/bookings`. **Interview:** why does registration order matter?

## 5. MongoDB and Mongoose

**Concept:** Mongo stores documents; Mongoose adds schema validation, references, middleware and query APIs. **In this app:** `server/models/Booking.js` and related models. **Exercise:** identify a required invariant and an index. **Interview:** when can a transaction be used in MongoDB?

## 6. Authentication and authorization

**Concept:** authentication establishes identity; authorization decides allowed actions. JWTs are signed claims; cookies require CSRF protection for unsafe requests. **In this app:** auth controller, `authMiddleware.js`, role/permission middleware and `authCookie.js`. **Exercise:** show why a client role check is insufficient. **Interview:** how is tenant mismatch rejected?

## 7. Multi-tenancy

**Concept:** one service hosts multiple organizations while isolating each tenant's data. **In this app:** tenant resolution, context, filters and Mongoose plugin. **Exercise:** trace a tenant ID from hostname/header to model query. **Interview:** what query types can bypass ordinary tenant filters?

## 8. Payments and distributed systems

**Concept:** provider calls and callbacks are asynchronous; network timeout may leave an uncertain result; duplicate delivery requires idempotent handling. **In this app:** M-Pesa service, callback middleware, payment lifecycle service and Payment model. **Exercise:** distinguish accepted STK request from completed payment. **Interview:** how do you safely handle a duplicate callback?

## 9. Testing and deployment

**Concept:** tests provide evidence only for their scope/environment; deployment manifests describe desired setup, not current state. **In this app:** Node tests, Playwright, Vite, Render and Vercel configuration. **Exercise:** identify which test requires Mongo and which uses a mock. **Interview:** what evidence would prove production payment readiness?

## Study method

For each feature, write its user story, trace UI → API wrapper → route → middleware → controller → service → model, then state one failure case and one security boundary. Re-run the associated safe unit/check after source changes. Use [code walkthrough](CODE_WALKTHROUGH.md) as the practical sequence.
