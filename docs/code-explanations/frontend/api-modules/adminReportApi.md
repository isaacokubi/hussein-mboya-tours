# Client API module: `client/src/api/adminReportApi.js`

**Source:** [client/src/api/adminReportApi.js](../../../../client/src/api/adminReportApi.js)

## Responsibility

This module is the client-side transport boundary for the admin report feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getDailyReport` (source line 7)

`async()=>{`

Calls: `GET /admin/reports/daily`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getMonthlyReport` (source line 20)

`async(params)=>{`

Calls: `GET /admin/reports/monthly`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTourReport` (source line 36)

`async()=>{`

Calls: `GET /admin/reports/tours`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAgentReport` (source line 49)

`async()=>{`

Calls: `GET /admin/reports/agents`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/admin/Reports.jsx`](../../../../client/src/pages/admin/Reports.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js


import api from "./axios";


export const getDailyReport =
async()=>{

const {data}=await api.get(
"/admin/reports/daily"
);

return data;

};



export const getMonthlyReport =
async(params)=>{

const {data}=await api.get(
"/admin/reports/monthly",
{
params
}
);

return data;

};



export const getTourReport =
async()=>{

const {data}=await api.get(
"/admin/reports/tours"
);

return data;

};



export const getAgentReport =
async()=>{

const {data}=await api.get(
"/admin/reports/agents"
);

return data;

};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
