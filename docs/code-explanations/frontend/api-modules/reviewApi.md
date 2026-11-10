# Client API module: `client/src/api/reviewApi.js`

**Source:** [client/src/api/reviewApi.js](../../../../client/src/api/reviewApi.js)

## Responsibility

This module is the client-side transport boundary for the review feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `createReview` (source line 3)

`async (payload) => (await api.post("/reviews", payload)).data`

Calls: `POST /reviews`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTourReviews` (source line 5)

`async (tourId) => {`

Calls: `GET /reviews/tour/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAdminReviews` (source line 10)

`async () => (await api.get("/admin/reviews")).data`

Calls: `GET /admin/reviews`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/adminReviewApi.js`](../../../../client/src/api/adminReviewApi.js)
- [`client/src/pages/TourDetails.jsx`](../../../../client/src/pages/TourDetails.jsx)
- [`client/src/pages/admin/AdminReviews.jsx`](../../../../client/src/pages/admin/AdminReviews.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const createReview = async (payload) => (await api.post("/reviews", payload)).data;

export const getTourReviews = async (tourId) => {
  if (!tourId) return { success: true, count: 0, reviews: [] };
  return (await api.get(`/reviews/tour/${tourId}`)).data;
};

export const getAdminReviews = async () => (await api.get("/admin/reviews")).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
