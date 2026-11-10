# Shared Axios client: `client/src/api/axios.js`

The module reads build-time API configuration, detects production build, and maintains an auth-generation counter used to prevent stale requests/responses crossing login/logout transitions. It chooses platform/client API base, validates production absolute HTTPS API URL and exact `/api` path, and uses local `/api` behavior on localhost so development does not silently target a deployed backend.

The shared Axios instance configures credentials and interceptors. The request interceptor detects public authentication/settings calls, strips inherited Authorization from public calls, otherwise chooses stored access token, derives authenticated tenant context, reads CSRF cookie for unsafe methods, and attaches matching headers. It also attaches public tenant identifiers where appropriate. The response interceptor handles auth failures/session transitions and propagates errors to callers. Query wrappers generally consume `response.data`.

Important consequence: `VITE_*` configuration is public client code; do not place secrets there. To debug a wrong API target, inspect `apiUrls.js`, this module's calculated `baseURL`, browser network requests, and dev/prod environment.
