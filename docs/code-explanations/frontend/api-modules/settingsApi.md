# Client API module: `client/src/api/settingsApi.js`

**Source:** [client/src/api/settingsApi.js](../../../../client/src/api/settingsApi.js)

## Responsibility

This module is the client-side transport boundary for the settings feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getSettings` (source line 3)

`async () => {`

Calls: `GET /admin/settings`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateSettings` (source line 14)

`async (settings = {}) => {`

Calls: `PUT /admin/settings`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getPublicSettings` (source line 31)

`async () => {`

Calls: `GET /settings/public`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/superAdminApi.js`](../../../../client/src/api/superAdminApi.js)
- [`client/src/context/SettingsContext.jsx`](../../../../client/src/context/SettingsContext.jsx)
- [`client/src/pages/Checkout.jsx`](../../../../client/src/pages/Checkout.jsx)
- [`client/src/pages/admin/AdminSettings.jsx`](../../../../client/src/pages/admin/AdminSettings.jsx)
- [`client/src/pages/admin/MpesaConfiguration.jsx`](../../../../client/src/pages/admin/MpesaConfiguration.jsx)
- [`client/src/pages/superadmin/SuperAdminSettings.jsx`](../../../../client/src/pages/superadmin/SuperAdminSettings.jsx)
- [`client/src/pages/tourManager/ManagerSettings.jsx`](../../../../client/src/pages/tourManager/ManagerSettings.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const getSettings = async () => {
  const { data } = await api.get("/admin/settings");
  return data;
};

/**
 * The settings route is an Express JSON endpoint. The previous implementation
 * sent FormData even when no logo was being uploaded. Because the route has no
 * multipart parser, req.body was empty and the controller fell back to its
 * defaults, making admin edits appear to save while the values did not stick.
 */
export const updateSettings = async (settings = {}) => {
  const payload = { ...settings };
  delete payload.logoFile;

  if (typeof payload.seoKeywords === "string") {
    payload.seoKeywords = payload.seoKeywords
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  const { data } = await api.put("/admin/settings", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
};

export const getPublicSettings = async () => {
  const { data } = await api.get("/settings/public");
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
