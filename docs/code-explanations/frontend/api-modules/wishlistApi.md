# Client API module: `client/src/api/wishlistApi.js`

**Source:** [client/src/api/wishlistApi.js](../../../../client/src/api/wishlistApi.js)

## Responsibility

This module is the client-side transport boundary for the wishlist feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getWishlist` (source line 16)

`async () => {`

Calls: `GET /wishlist`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `addWishlist` (source line 34)

`async (tourId) => {`

Calls: `POST /wishlist`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `removeWishlist` (source line 55)

`async (tourId) => {`

Calls: `DELETE /wishlist/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/components/tours/TourCard.jsx`](../../../../client/src/components/tours/TourCard.jsx)
- [`client/src/components/tours/wishListButton.jsx`](../../../../client/src/components/tours/wishListButton.jsx)
- [`client/src/pages/Wishlist.jsx`](../../../../client/src/pages/Wishlist.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";


/*
|--------------------------------------------------------------------------
| WISHLIST MANAGEMENT
|--------------------------------------------------------------------------
*/


// ============================================================
// GET USER WISHLIST
// GET /api/wishlist
// ============================================================

export const getWishlist = async () => {

  const { data } = await api.get(
    "/wishlist"
  );

  return data;

};




// ============================================================
// ADD TOUR TO WISHLIST
// POST /api/wishlist
// ============================================================

export const addWishlist = async (tourId) => {

  const { data } = await api.post(
    "/wishlist",
    {
      tourId,
    }
  );

  return data;

};




// ============================================================
// REMOVE TOUR FROM WISHLIST
// DELETE /api/wishlist/:tourId
// ============================================================

export const removeWishlist = async (tourId) => {

  const { data } = await api.delete(
    `/wishlist/${tourId}`
  );

  return data;

};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
