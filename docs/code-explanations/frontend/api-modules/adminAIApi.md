# Client API module: `client/src/api/adminAIApi.js`

**Source:** [client/src/api/adminAIApi.js](../../../../client/src/api/adminAIApi.js)

## Responsibility

This module is the client-side transport boundary for the admin ai feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAIDashboard` (source line 4)

`async () => {`

Calls: `GET /admin-ai/dashboard`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAIAnalytics` (source line 10)

`async () => {`

Calls: `GET /admin-ai/analytics`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAIBriefing` (source line 16)

`async () => {`

Calls: `GET /admin-ai/briefing`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `askAdminAI` (source line 22)

`async (message) => {`

Calls: `POST /admin-ai/query`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAIIntelligence` (source line 34)

`async () => {`

Calls: `GET /admin-ai/intelligence`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAIAlerts` (source line 40)

`async () => {`

Calls: `GET /admin-ai/alerts`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `generateCustomerReply` (source line 50)

`async(payload)=>{`

Calls: `POST /admin-ai/customer-support`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAIRevenueAdvice` (source line 63)

`async()=>{`

Calls: `GET /admin-ai/revenue-advice`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getBookingRiskAnalysis` (source line 75)

`async()=>{`

Calls: `GET /admin-ai/booking-risks`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAITasks` (source line 87)

`async()=>{`

Calls: `GET /admin-ai/tasks`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateAITask` (source line 99)

`async(`

Calls: `PATCH /admin-ai/tasks/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTourPricingAdvice` (source line 115)

`async()=>{`

Calls: `GET /admin-ai/pricing-advice`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTourRecommendations` (source line 126)

`async(customerId)=>{`

Calls: `GET /admin-ai/recommendations/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAIFraudMonitoring` (source line 137)

`async()=>{`

Calls: `GET /admin-ai/fraud-monitoring`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAISentimentAnalysis` (source line 148)

`async()=>{`

Calls: `GET /admin-ai/sentiment`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAIMarketingCampaigns` (source line 159)

`async()=>{`

Calls: `GET /admin-ai/marketing-campaigns`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAIFinancialForecast` (source line 170)

`async()=>{`

Calls: `GET /admin-ai/financial-forecast`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAIOperationsCenter` (source line 181)

`async()=>{`

Calls: `GET /admin-ai/operations-center`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAISalesAssistant` (source line 192)

`async()=>{`

Calls: `GET /admin-ai/sales-assistant`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/components/AICustomer.jsx`](../../../../client/src/components/AICustomer.jsx)
- [`client/src/components/admin/AICustomerSupport.jsx`](../../../../client/src/components/admin/AICustomerSupport.jsx)
- [`client/src/components/admin/AIOperationsCopilot.jsx`](../../../../client/src/components/admin/AIOperationsCopilot.jsx)
- [`client/src/pages/admin/AdminAITools.jsx`](../../../../client/src/pages/admin/AdminAITools.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";


export const getAIDashboard = async () => {
  const { data } = await api.get("/admin-ai/dashboard");
  return data;
};


export const getAIAnalytics = async () => {
  const { data } = await api.get("/admin-ai/analytics");
  return data;
};


export const getAIBriefing = async () => {
  const { data } = await api.get("/admin-ai/briefing");
  return data;
};


export const askAdminAI = async (message) => {
  const { data } = await api.post(
    "/admin-ai/query",
    {
      message,
    }
  );

  return data;
};


export const getAIIntelligence = async () => {
  const { data } = await api.get("/admin-ai/intelligence");
  return data;
};


export const getAIAlerts = async () => {

  const { data } =
    await api.get("/admin-ai/alerts");

  return data;

};


export const generateCustomerReply = async(payload)=>{

  const {data} =
    await api.post(
      "/admin-ai/customer-support",
      payload
    );

  return data;

};


export const getAIRevenueAdvice = async()=>{

  const {data} =
    await api.get(
      "/admin-ai/revenue-advice"
    );

  return data;

};


export const getBookingRiskAnalysis = async()=>{

  const {data} =
    await api.get(
      "/admin-ai/booking-risks"
    );

  return data;

};


export const getAITasks = async()=>{

const {data}=await api.get(
"/admin-ai/tasks"
);

return data;

};



export const updateAITask = async(
id,status
)=>{

const {data}=await api.patch(
`/admin-ai/tasks/${id}`,
{
status
}
);

return data;

};


export const getTourPricingAdvice = async()=>{

const {data}=await api.get(
"/admin-ai/pricing-advice"
);

return data;

};


export const getTourRecommendations = async(customerId)=>{

const {data}=await api.get(
`/admin-ai/recommendations/${customerId}`
);

return data;

};


export const getAIFraudMonitoring = async()=>{

const {data}=await api.get(
"/admin-ai/fraud-monitoring"
);

return data;

};


export const getAISentimentAnalysis = async()=>{

const {data}=await api.get(
"/admin-ai/sentiment"
);

return data;

};


export const getAIMarketingCampaigns = async()=>{

const {data}=await api.get(
"/admin-ai/marketing-campaigns"
);

return data;

};


export const getAIFinancialForecast = async()=>{

const {data}=await api.get(
"/admin-ai/financial-forecast"
);

return data;

};


export const getAIOperationsCenter = async()=>{

const {data}=await api.get(
"/admin-ai/operations-center"
);

return data;

};


export const getAISalesAssistant = async()=>{

const {data}=await api.get(
"/admin-ai/sales-assistant"
);

return data;

};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
