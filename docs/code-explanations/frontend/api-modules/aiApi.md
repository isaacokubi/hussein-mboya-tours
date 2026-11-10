# Client API module: `client/src/api/aiApi.js`

**Source:** [client/src/api/aiApi.js](../../../../client/src/api/aiApi.js)

## Responsibility

This module is the client-side transport boundary for the ai feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- axios from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `askAI` (source line 31)

`async (`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `askTravelAI` (source line 55)

`askAI`

No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/components/HusseinAIWidget.jsx`](../../../../client/src/components/HusseinAIWidget.jsx)
- [`client/src/components/ai/AIAssistant.jsx`](../../../../client/src/components/ai/AIAssistant.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import axios from "./axios";


const getSessionId = () => {

  let id =
    localStorage.getItem(
      "ai_session_id"
    );


  if(!id){

    id =
      crypto.randomUUID();

    localStorage.setItem(
      "ai_session_id",
      id
    );

  }


  return id;

};



export const askAI = async (
  message
)=>{

  const response =
    await axios.post(
      "/ai/chat",
      {
        message
      },
      {
        headers:{
          "x-ai-session":
            getSessionId()
        }
      }
    );


  return response.data;

};


export const askTravelAI = askAI;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
