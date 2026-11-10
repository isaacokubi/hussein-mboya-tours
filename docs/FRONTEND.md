# Frontend

## Stack and composition

The client is a Vite-built React 19 single-page application. `src/main.jsx` creates the root, and `src/App.jsx` composes shared providers/chrome and routes. `src/routes/AppRoutes.jsx` maps URL paths to lazy-loaded pages with Suspense fallbacks. The React Router configuration includes public discovery, customer booking, hospitality, agent, guide, driver, tour-manager, tenant-admin and platform-super-admin sections.

## State and server communication

TanStack Query (`@tanstack/react-query`) handles remote data/cache in pages and hooks. Contexts in `src/context/` supply cross-page auth, tenant, settings, cart and notifications. `src/api/axios.js` is the shared Axios transport; domain modules under `src/api/` define backend calls. Mutations commonly invalidate/refetch relevant query keys. The API base URL and tenant hints are defined in the API URL/client configuration and Vite environment variables.

Socket.IO client code exists under `src/socket/` for real-time events. Its actual usefulness depends on server events, connection URL, and deployment configuration.

## Routes, roles and layout

Route declarations are centralized in `routes/AppRoutes.jsx` and use `ProtectedRoute`, `AdminRoute`, `AgentRoute`, and related components for user experience and early navigation control. Admin, agent, tour-manager and super-admin layouts provide navigational shells. These frontend checks improve usability; the Express middleware must still enforce access for every API operation.

## Forms, validation and UX

Forms live primarily in route pages and reusable components such as `components/booking/TravellerForm.jsx` and `CouponInput.jsx`. Validation is implemented per feature in UI and again at server boundaries; do not infer a single global form-validation library. Loading states use query/mutation state and Suspense. Errors are typically presented from Axios response data or toast messages. Shared styles reside in `index.css`, `App.css`, and `styles/`; Tailwind 4 is configured via Vite. Pages use responsive utility classes and mobile navigation components, but the presence of responsive CSS is not equivalent to a formal accessibility audit.

## Main user flows

- Browse: home/tours/destinations pages call public catalog API wrappers and link to detail pages.
- Reserve: authenticated customer flows collect traveler/date/contact data, submit booking/reservation requests, then navigate to checkout/status pages.
- Staff operations: role dashboards fetch scoped summaries and lists; actions call domain API wrappers and refresh cached data.
- Payment follow-up: checkout/status screens start a payment method and retrieve persisted status. The UI response means the request was accepted by the API; final financial state depends on verified backend provider handling.

For a concrete cross-stack trace see [code walkthrough](interview/CODE_WALKTHROUGH.md).
