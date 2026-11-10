# Client API module: `client/src/api/apiUrls.js`

**Source:** [client/src/api/apiUrls.js](../../../../client/src/api/apiUrls.js)

## Responsibility

This module is the client-side transport boundary for the api urls feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- No imports detected.

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `resolveSocketUrl` (source line 8)

`function resolveSocketUrl(browserOrigin = "") {`

Contains local try/catch behavior; read the catch branch below to see fallback/error policy.
### `socketUrl` (source line 40)

`validateProductionSocketUrl(resolvedSocketUrl)`

No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/main.jsx`](../../../../client/src/main.jsx)
- [`client/src/socket/socket.js`](../../../../client/src/socket/socket.js)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
const platformMode = String(import.meta.env.VITE_PLATFORM_MODE || "").trim().toLowerCase() === "true";
const configuredApiUrl = String(
  import.meta.env.VITE_API_URL || (platformMode ? import.meta.env.VITE_PLATFORM_API_URL : "") || "",
).trim();
const configuredSocketUrl = String(import.meta.env.VITE_SOCKET_URL || "").trim();
const productionBuild = Boolean(import.meta.env.PROD);

export function resolveSocketUrl(browserOrigin = "") {
  if (configuredSocketUrl) return configuredSocketUrl.replace(/\/$/, "");
  if (configuredApiUrl) {
    try {
      return new URL(configuredApiUrl).origin;
    } catch {
      // Relative API URLs use the same origin as the page.
    }
  }
  return browserOrigin;
}

const resolvedSocketUrl = resolveSocketUrl(
  typeof window === "undefined" ? "" : window.location.origin,
);

function validateProductionSocketUrl(value) {
  if (!productionBuild) return value;
  let socket;
  let api;
  try {
    socket = new URL(value);
    api = new URL(configuredApiUrl);
  } catch {
    throw new Error("Production Socket.IO must use an absolute HTTPS origin.");
  }
  if (socket.protocol !== "https:" || socket.origin !== api.origin || socket.pathname !== "/" || socket.search || socket.hash || socket.username || socket.password) {
    throw new Error("Production VITE_SOCKET_URL must be the HTTPS origin of VITE_API_URL, without a path.");
  }
  return socket.origin;
}

export const socketUrl = validateProductionSocketUrl(resolvedSocketUrl);
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
