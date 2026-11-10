# Client API module: `client/src/api/destinationApi.js`

**Source:** [client/src/api/destinationApi.js](../../../../client/src/api/destinationApi.js)

## Responsibility

This module is the client-side transport boundary for the destination feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getFeaturedDestinations` (source line 4)

`async()=>{`

Calls: `GET /destinations/featured`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDestinations` (source line 33)

`async()=>{`

Calls: `GET /destinations`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDestinationBySlug` (source line 51)

`async(slug)=>{`

Calls: `GET /destinations/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/adminDestinationApi.js`](../../../../client/src/api/adminDestinationApi.js)
- [`client/src/api/adminTourApi.js`](../../../../client/src/api/adminTourApi.js)
- [`client/src/api/tourApi.js`](../../../../client/src/api/tourApi.js)
- [`client/src/components/home/DestinationsSection.jsx`](../../../../client/src/components/home/DestinationsSection.jsx)
- [`client/src/pages/tourManager/CreateTour.jsx`](../../../../client/src/pages/tourManager/CreateTour.jsx)
- [`client/src/pages/tourManager/EditTour.jsx`](../../../../client/src/pages/tourManager/EditTour.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";


export const getFeaturedDestinations = async()=>{

  const response = await api.get(
    "/destinations/featured"
  );


  const destinations =

    Array.isArray(response.data)

    ? response.data

    : Array.isArray(response.data.data)

    ? response.data.data

    : Array.isArray(response.data.destinations)

    ? response.data.destinations

    : [];



  return destinations;

};

export const getDestinations = async()=>{

    const response = await api.get(
        "/destinations"
    );


    return Array.isArray(response.data)
        ? response.data
        :
        response.data.data ||
        response.data.destinations ||
        [];

};



export const getDestinationBySlug = async(slug)=>{

  const response = await api.get(
    `/destinations/${slug}`
  );


  return (
    response.data.destination ||
    response.data.data ||
    null
  );

};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
