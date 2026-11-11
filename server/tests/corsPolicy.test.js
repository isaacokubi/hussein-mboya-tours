/**
 * Purpose: cors Policy.test automated test. Main declarations: invoke.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load cors so this module can use its exported dependencies.
import cors from "cors";
// Load ../config/corsPolicy.js so this module can use its exported dependencies.
import { getConfiguredOrigins, isConfiguredOrigin, isValidConfiguredOrigin } from "../config/corsPolicy.js";

// Declare stagingOrigin for use by the surrounding module or function.
const stagingOrigin = "https://hussein-mboya-tours-2-l3m78h6fz-isaacokubis-projects.vercel.app";
// Declare productionOrigin for use by the surrounding module or function.
const productionOrigin = "https://www.globaltours.com";

// Perform the side effect or state update expressed on the following line.
test("configured staging and production origins are exact HTTPS origins", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(getConfiguredOrigins({ CLIENT_ORIGINS: stagingOrigin, CLIENT_URL: "https://unused.example" }), [stagingOrigin]);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isConfiguredOrigin(stagingOrigin, [stagingOrigin]), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isConfiguredOrigin("https://unrelated.example", [stagingOrigin]), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isValidConfiguredOrigin(productionOrigin, { production: true }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isConfiguredOrigin(productionOrigin, [productionOrigin]), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isValidConfiguredOrigin("*", { production: true }), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isValidConfiguredOrigin("https://*", { production: true }), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isValidConfiguredOrigin("http://localhost:5173", { production: true }), false);
});

// Perform the side effect or state update expressed on the following line.
test("CORS serves credentials and preflight only to configured origins", async () => {
  // Declare configuredOrigins for use by the surrounding module or function.
  const configuredOrigins = [stagingOrigin, productionOrigin];
  // Declare middleware for use by the surrounding module or function.
  const middleware = cors({
    origin: (origin, callback) => callback(null, !origin || isConfiguredOrigin(origin, configuredOrigins)),
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  // Declare invoke for use by the surrounding module or function.
  const invoke = (method, headers) => new Promise((resolve, reject) => {
    // Declare responseHeaders for use by the surrounding module or function.
    const responseHeaders = {};
    // Declare req for use by the surrounding module or function.
    const req = {
      method,
      headers,
      header: (name) => headers[name.toLowerCase()],
    };
    // Declare res for use by the surrounding module or function.
    const res = {
      statusCode: 200,
      setHeader: (name, value) => { responseHeaders[name.toLowerCase()] = value; },
      getHeader: (name) => responseHeaders[name.toLowerCase()],
      end: () => resolve({ statusCode: res.statusCode, headers: responseHeaders }),
    };
    // Perform the side effect or state update expressed on the following line.
    middleware(req, res, (error) => error ? reject(error) : resolve({ statusCode: res.statusCode, headers: responseHeaders }));
  });

  // Declare preflight for use by the surrounding module or function.
  const preflight = await invoke("OPTIONS", {
    origin: stagingOrigin,
    "access-control-request-method": "POST",
    "access-control-request-headers": "content-type,authorization",
  });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(preflight.statusCode, 204);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(preflight.headers["access-control-allow-origin"], stagingOrigin);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(preflight.headers["access-control-allow-credentials"], "true");
  // Perform the side effect or state update expressed on the following line.
  assert.match(preflight.headers["access-control-allow-methods"], /POST/);

  // Declare normal for use by the surrounding module or function.
  const normal = await invoke("GET", { origin: stagingOrigin });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(normal.headers["access-control-allow-origin"], stagingOrigin);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(normal.headers["access-control-allow-credentials"], "true");

  // Declare production for use by the surrounding module or function.
  const production = await invoke("GET", { origin: productionOrigin });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(production.headers["access-control-allow-origin"], productionOrigin);

  // Declare unrelated for use by the surrounding module or function.
  const unrelated = await invoke("GET", { origin: "https://unrelated.example" });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(unrelated.headers["access-control-allow-origin"], undefined);

  // Declare wildcard for use by the surrounding module or function.
  const wildcard = await invoke("GET", { origin: "*" });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(wildcard.headers["access-control-allow-origin"], undefined);
});
