# Client API module: `client/src/api/heroApi.js`

**Source:** [client/src/api/heroApi.js](../../../../client/src/api/heroApi.js)

## Responsibility

This module is the client-side transport boundary for the hero feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getHeroSlides` (source line 15)

`async () => {`

Calls: `GET /hero`. Returns/destructures Axios response data rather than exposing the full transport response. Contains local try/catch behavior; read the catch branch below to see fallback/error policy.
### `getAll` (source line 32)

`async () => {`

Calls: `GET /hero`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/admin/systemHealthApi.js`](../../../../client/src/api/admin/systemHealthApi.js)
- [`client/src/api/categoryApi.js`](../../../../client/src/api/categoryApi.js)
- [`client/src/api/crmApi.js`](../../../../client/src/api/crmApi.js)
- [`client/src/api/galleryApi.js`](../../../../client/src/api/galleryApi.js)
- [`client/src/api/notificationApi.js`](../../../../client/src/api/notificationApi.js)
- [`client/src/api/staffApi.js`](../../../../client/src/api/staffApi.js)
- [`client/src/api/userApi.js`](../../../../client/src/api/userApi.js)
- [`client/src/components/home/HeroSlider.jsx`](../../../../client/src/components/home/HeroSlider.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

const FALLBACK_HERO_SLIDES = [
  {
    _id: "default-hussein-mboya-hero",
    image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=2200&q=92",
    badge: "KENYA SAFARIS • BEACH • ADVENTURE",
    title: "Experience the Magic of Kenya",
    description: "From the Maasai Mara to the coast, discover extraordinary places with local experts.",
    buttonText: "Explore Tours",
    buttonLink: "/tours",
  },
];

export const getHeroSlides = async () => {
  try {
    const response = await api.get("/hero");
    const slides = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.slides)
        ? response.data.slides
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
    return slides.length ? slides : FALLBACK_HERO_SLIDES;
  } catch (error) {
    if (import.meta.env.DEV) console.warn("Optional hero CMS content unavailable; using the configured public hero fallback.", error);
    return FALLBACK_HERO_SLIDES;
  }
};

export const getAll = async () => {
  const { data } = await api.get("/hero");
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
