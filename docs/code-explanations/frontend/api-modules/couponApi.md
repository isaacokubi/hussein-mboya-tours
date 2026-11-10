# Client API module: `client/src/api/couponApi.js`

**Source:** [client/src/api/couponApi.js](../../../../client/src/api/couponApi.js)

## Responsibility

This module is the client-side transport boundary for the coupon feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getCoupons` (source line 10)

`async () => {`

Calls: `GET /admin/coupons`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createCoupon` (source line 17)

`async (payload) => {`

Calls: `POST /admin/coupons`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateCoupon` (source line 22)

`async (id, payload) => {`

Calls: `PUT /admin/coupons/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteCoupon` (source line 27)

`async (id) => {`

Calls: `DELETE /admin/coupons/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/admin/AdminCoupons.jsx`](../../../../client/src/pages/admin/AdminCoupons.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

const normalizeCouponResponse = (data) => {
  if (Array.isArray(data)) return { coupons: data };
  if (Array.isArray(data?.coupons)) return data;
  if (Array.isArray(data?.data?.coupons)) return data.data;
  return { ...(data || {}), coupons: [] };
};

export const getCoupons = async () => {
  const { data } = await api.get("/admin/coupons", {
    params: { _ts: Date.now() },
  });
  return normalizeCouponResponse(data);
};

export const createCoupon = async (payload) => {
  const { data } = await api.post("/admin/coupons", payload);
  return data;
};

export const updateCoupon = async (id, payload) => {
  const { data } = await api.put(`/admin/coupons/${id}`, payload);
  return data;
};

export const deleteCoupon = async (id) => {
  const { data } = await api.delete(`/admin/coupons/${id}`);
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
