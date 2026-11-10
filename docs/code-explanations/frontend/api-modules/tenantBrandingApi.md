# Client API module: `client/src/api/tenantBrandingApi.js`

**Source:** [client/src/api/tenantBrandingApi.js](../../../../client/src/api/tenantBrandingApi.js)

## Responsibility

This module is the client-side transport boundary for the tenant branding feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getTenantBranding` (source line 7)

`async () => {`

Calls: `GET /settings/public`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `updateTenantBranding` (source line 31)

`async (data) => {`

Calls: `PUT /tenant/branding`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/context/TenantContext.jsx`](../../../../client/src/context/TenantContext.jsx)
- [`client/src/pages/admin/TenantBranding.jsx`](../../../../client/src/pages/admin/TenantBranding.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

/**
 * Public branding is resolved from the active tenant by /api/settings/public.
 * Do not hard-code a business name here: the same frontend must work for every tenant.
 */
export const getTenantBranding = async () => {
  const response = await api.get("/settings/public", {
    params: { _t: Date.now() },
  });

  const settings = response.data?.settings || response.data?.data || {};
  const companyName = settings.companyName || settings.name || "";
  const logo = settings.companyLogo || settings.logo || "";

  return {
    ...response.data,
    branding: {
      ...settings,
      name: companyName,
      legalName: settings.legalName || companyName,
      logo,
      logoUrl: settings.companyLogo || settings.logoUrl || logo,
      contactEmail: settings.supportEmail || "",
      contactPhone: settings.supportPhone || "",
      website: settings.websiteUrl || "",
    },
  };
};

export const updateTenantBranding = async (data) => {
  const response = await api.put("/tenant/branding", data);
  return response.data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
