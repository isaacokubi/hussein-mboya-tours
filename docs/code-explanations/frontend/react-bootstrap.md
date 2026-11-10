# React bootstrap and routes

## `client/src/main.jsx`

Imports ReactDOM, BrowserRouter, TanStack Query provider/client, App, auth/settings/cart/tenant providers, socket URL, global CSS and a pickup-time synchronization utility. `createRoot(...).render(...)` mounts the React tree. Providers nest so descendants can use query cache, navigation, identity, settings, cart and tenant context. The pickup utility is imported for its startup side effect. In development, the code logs effective API/socket URLs for debugging; these values must not contain secrets.

## `client/src/App.jsx`

The app shell lazily imports selected standalone admin pages, checks the current location for pages that need a bare admin layout, then renders either those pages or `AppRoutes`. Navbar/footer are suppressed in role dashboard paths; the AI widget and toast container are composed globally. `PlanFeatureGate` wraps application content. Suspense fallbacks keep lazy route loading visible.

## `client/src/routes/AppRoutes.jsx`

The module lazy-loads numerous route pages to split bundles and imports route guard components synchronously. `Routes` maps public paths and role-protected paths to pages. Parent routes nest dashboards under layouts; child paths render in the layout's outlet. `ScrollToTop` observes path/search changes and resets scroll. Unknown URLs redirect to `/`.

Role checks here are navigation behavior, not security authority. Corresponding backend route guards must enforce every protected data operation.
