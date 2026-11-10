# Client API module: `client/src/api/categoryApi.js`

**Source:** [client/src/api/categoryApi.js](../../../../client/src/api/categoryApi.js)

## Responsibility

This module is the client-side transport boundary for the category feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getCategories` (source line 5)

`async()=>{`

Calls: `GET /categories`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAll` (source line 27)

`async()=>{`

Calls: `GET /categories`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/admin/systemHealthApi.js`](../../../../client/src/api/admin/systemHealthApi.js)
- [`client/src/api/crmApi.js`](../../../../client/src/api/crmApi.js)
- [`client/src/api/galleryApi.js`](../../../../client/src/api/galleryApi.js)
- [`client/src/api/heroApi.js`](../../../../client/src/api/heroApi.js)
- [`client/src/api/notificationApi.js`](../../../../client/src/api/notificationApi.js)
- [`client/src/api/staffApi.js`](../../../../client/src/api/staffApi.js)
- [`client/src/api/userApi.js`](../../../../client/src/api/userApi.js)
- [`client/src/components/home/CategoriesSection.jsx`](../../../../client/src/components/home/CategoriesSection.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";



export const getCategories = async()=>{


const response = await api.get(

"/categories"

);



return response.data.categories;


};



/*
 Auto completed API helpers
*/

export const getAll = async()=>{
    const {data}=await api.get("/categories");
    return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
