import test from "node:test";
import assert from "node:assert/strict";
import cors from "cors";
import { getConfiguredOrigins, isConfiguredOrigin, isValidConfiguredOrigin } from "../config/corsPolicy.js";

const stagingOrigin = "https://hussein-mboya-tours-2-l3m78h6fz-isaacokubis-projects.vercel.app";
const productionOrigin = "https://www.globaltours.com";

test("configured staging and production origins are exact HTTPS origins", () => {
  assert.deepEqual(getConfiguredOrigins({ CLIENT_ORIGINS: stagingOrigin, CLIENT_URL: "https://unused.example" }), [stagingOrigin]);
  assert.equal(isConfiguredOrigin(stagingOrigin, [stagingOrigin]), true);
  assert.equal(isConfiguredOrigin("https://unrelated.example", [stagingOrigin]), false);
  assert.equal(isValidConfiguredOrigin(productionOrigin, { production: true }), true);
  assert.equal(isConfiguredOrigin(productionOrigin, [productionOrigin]), true);
  assert.equal(isValidConfiguredOrigin("*", { production: true }), false);
  assert.equal(isValidConfiguredOrigin("https://*", { production: true }), false);
  assert.equal(isValidConfiguredOrigin("http://localhost:5173", { production: true }), false);
});

test("CORS serves credentials and preflight only to configured origins", async () => {
  const configuredOrigins = [stagingOrigin, productionOrigin];
  const middleware = cors({
    origin: (origin, callback) => callback(null, !origin || isConfiguredOrigin(origin, configuredOrigins)),
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  const invoke = (method, headers) => new Promise((resolve, reject) => {
    const responseHeaders = {};
    const req = {
      method,
      headers,
      header: (name) => headers[name.toLowerCase()],
    };
    const res = {
      statusCode: 200,
      setHeader: (name, value) => { responseHeaders[name.toLowerCase()] = value; },
      getHeader: (name) => responseHeaders[name.toLowerCase()],
      end: () => resolve({ statusCode: res.statusCode, headers: responseHeaders }),
    };
    middleware(req, res, (error) => error ? reject(error) : resolve({ statusCode: res.statusCode, headers: responseHeaders }));
  });

  const preflight = await invoke("OPTIONS", {
    origin: stagingOrigin,
    "access-control-request-method": "POST",
    "access-control-request-headers": "content-type,authorization",
  });
  assert.equal(preflight.statusCode, 204);
  assert.equal(preflight.headers["access-control-allow-origin"], stagingOrigin);
  assert.equal(preflight.headers["access-control-allow-credentials"], "true");
  assert.match(preflight.headers["access-control-allow-methods"], /POST/);

  const normal = await invoke("GET", { origin: stagingOrigin });
  assert.equal(normal.headers["access-control-allow-origin"], stagingOrigin);
  assert.equal(normal.headers["access-control-allow-credentials"], "true");

  const production = await invoke("GET", { origin: productionOrigin });
  assert.equal(production.headers["access-control-allow-origin"], productionOrigin);

  const unrelated = await invoke("GET", { origin: "https://unrelated.example" });
  assert.equal(unrelated.headers["access-control-allow-origin"], undefined);

  const wildcard = await invoke("GET", { origin: "*" });
  assert.equal(wildcard.headers["access-control-allow-origin"], undefined);
});
