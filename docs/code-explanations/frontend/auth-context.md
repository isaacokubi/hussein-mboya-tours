# `client/src/context/AuthContext.jsx` — browser session state

`AuthProvider` exposes the current user/session state to React components. It coordinates backend login/logout and session restoration, persists a public user projection for fast UI hydration, and clears TanStack Query cache when the identity changes. It is a user-interface state layer; backend middleware remains the access-control authority.

## Normalization before state is exposed

- `normalizePermissions` accepts strings or permission objects, trims names, removes empty values, and deduplicates case-insensitively. This gives menu/guard code a consistent representation.
- `extractRolePermissions` merges populated role permissions; `normalizeUser` adds role fallback permissions for admin/super-admin plus overrides/direct permissions.
- `readStoredUser` hydrates initial UI state from localStorage but treats parse errors as invalid and removes corrupt user data. Stored role/permission values are not cryptographic proof; `/auth/me` restores the authoritative account.
- `preloadTenantSettings` skips platform super-admin, fetches public settings for the tenant, caches them under tenant-specific key, and dispatches a settings-updated event. Failure is logged and returns `null`; a settings provider can retry.

## Session persistence and cleanup

`persistUser` normalizes user data, updates React state, writes user/permission/tenant metadata to localStorage, and removes tenant identifiers for users without a tenant. `clearAuthStorage` deletes token aliases, user, permissions and tenant selectors. Treat these persisted values as UI hints; server reloads and checks the account for protected requests.

`logout` increments `authOperation` and Axios auth generation so older async work cannot restore the session, attempts `POST /auth/logout` to clear server cookies, then clears browser storage and query cache and navigates to login. Even if the HTTP request fails, local UI state is removed; a stateless bearer token may remain cryptographically valid until expiry, so the server must still apply expiry/current-user checks.

## Startup restore and stale response protection

On mount, the provider reads cached user immediately and calls `/auth/me`. It captures the current `authOperation` number. Every completion branch compares that number before changing state: if a newer login/logout began while `/me` was pending, the older result is ignored. A valid response refreshes the persisted user and tenant settings; a failure clears local session state. This is a race guard against an initial slow response overwriting a newer login.

The `auth:session-invalid` event uses the same cleanup path and redirects to login when needed. The Axios response interceptor dispatches this event for invalid sessions. Event cleanup is registered on mount and removed on unmount.

## Login and account switching

Before `POST /auth/login`, login increments the operation/generation, clears React Query cache, removes prior tokens/user/tenant selectors, and marks loading. Clearing cache is essential because some query keys are generic; without it, data from the previous tenant could briefly remain visible after switching accounts.

The request lowercases email but leaves password unchanged. An MFA-required response is returned to the caller without establishing the normal session; the MFA UI must complete its own verification flow. Otherwise, the provider requires both user and token, stores token in localStorage as a fallback, normalizes/persists user, sets authenticated state, preloads tenant settings and returns the response.

The server also sets an HttpOnly cookie. LocalStorage bearer fallback is readable to JavaScript and therefore increases impact if an XSS vulnerability exists; this tradeoff is explicitly present in source for browsers where cross-site cookies may fail. Never put additional long-lived secrets in localStorage.

## Registration mismatch worth knowing

The frontend's `register` function only establishes a session if the registration response contains both `user` and `token`. The current backend `register` handler returns a user and message but no token, so this function returns registration data without authenticating the browser. The UI must direct the customer to login or otherwise account for this response; do not claim registration automatically logs the user in based on this provider code.

## Permission helpers and limits

`hasPermission`, `hasAnyPermission`, `hasAllPermissions` and `hasRole` support client navigation/menu decisions. A role-based fallback list is mirrored in the client for UX. These helpers can be altered by the browser and do not secure API data; use server `protect`, role/permission middleware, tenant filters, and resource ownership checks.

## Debugging practice

When a user sees stale tenant data, inspect query key scoping, `queryClient.clear()` during login/logout, local storage tenant keys, Axios request headers and the server's `req.user/req.tenantId`. For a session loop, inspect `/auth/me`, the Axios invalid-session event, cookie attributes and the auth generation counter. Never log JWT values.

**Related:** [Axios client](axios-client.md), [server auth controller](../backend/auth-controller.md), [server auth middleware](../backend/auth-middleware.md), [checkout state](checkout-state.md).
