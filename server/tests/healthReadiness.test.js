import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import express from "express";
import test from "node:test";

// Keep this runtime test independent of a developer's ignored .env file.
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/health_readiness_test";
process.env.JWT_SECRET = "ci-only-test-secret";
for (const key of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) process.env[key] = "";

const [{ default: mongoose }, { default: app }, { setStartupPhase }, { default: upload }] = await Promise.all([
  import("mongoose"),
  import("../app.js"),
  import("../startup/readiness.js"),
  import("../middleware/uploadMiddleware.js"),
]);

const startApp = async () => {
  const server = createServer(app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
};

const launchServer = async (overrides = {}) => {
  const { spawn } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const child = spawn(process.execPath, ["server.js"], {
    cwd: serverDirectory,
    env: {
      PATH: process.env.PATH || "/usr/bin:/bin",
      NODE_ENV: "test",
      MONGODB_URI: "mongodb://127.0.0.1:1/startup_health_test",
      MONGODB_SERVER_SELECTION_TIMEOUT_MS: "1500",
      MONGODB_STARTUP_MIGRATION_TIMEOUT_MS: "10000",
      JWT_SECRET: "ci-only-test-secret",
      DEFAULT_TENANT_ID: "000000000000000000000000",
      CLOUDINARY_CLOUD_NAME: "",
      CLOUDINARY_API_KEY: "",
      CLOUDINARY_API_SECRET: "",
      PORT: "0",
      ...overrides,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const childExit = once(child, "exit");
  let output = "";
  child.stdout.setEncoding("utf8").on("data", (chunk) => { output += chunk; });
  child.stderr.setEncoding("utf8").on("data", (chunk) => { output += chunk; });

  const port = await new Promise((resolvePort, reject) => {
    // Importing the complete production route graph can take several seconds in
    // parallel CI runs; keep the assertion bounded without mistaking import
    // contention for a listener-order regression.
    const timeout = setTimeout(() => reject(new Error(`HTTP listener did not start promptly. Output: ${output}`)), 15_000);
    const findPort = () => {
      const match = output.match(/HTTP server listening on port (\d+)/);
      if (!match) return false;
      clearTimeout(timeout);
      resolvePort(Number(match[1]));
      return true;
    };
    child.stdout.on("data", findPort);
    child.stderr.on("data", findPort);
    child.once("error", (error) => { clearTimeout(timeout); reject(error); });
    child.once("exit", (code) => {
      if (!findPort()) {
        clearTimeout(timeout);
        reject(new Error(`Server exited before listening (code ${code}).`));
      }
    });
  });

  return { child, childExit, port, output: () => output };
};

const waitForChildExit = (childExit, timeoutMs) => new Promise((resolveExit, reject) => {
  const timeout = setTimeout(() => reject(new Error("Server process did not exit within its configured timeout.")), timeoutMs);
  childExit.then((result) => { clearTimeout(timeout); resolveExit(result); }, (error) => { clearTimeout(timeout); reject(error); });
});

test("health and root routes stay reachable and report real database readiness", async (t) => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  const { server, baseUrl } = await startApp();
  t.after(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    await new Promise((resolve) => server.close(resolve));
  });

  setStartupPhase("starting");
  let response = await fetch(`${baseUrl}/api/health`);
  let payload = await response.json();
  assert.equal(response.status, 503);
  assert.equal(payload.success, false);
  assert.equal(payload.status, "starting");
  assert.equal(payload.database, "disconnected");

  setStartupPhase("ready");
  response = await fetch(`${baseUrl}/api/health`);
  payload = await response.json();
  assert.equal(response.status, 503);
  assert.equal(payload.success, false);
  assert.equal(payload.status, "degraded");
  assert.equal(payload.database, "disconnected");

  response = await fetch(`${baseUrl}/api/users`);
  assert.equal(response.status, 503, "database-backed routes fail promptly while unavailable");

  response = await fetch(`${baseUrl}/`);
  payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.message, "Travel API running successfully");
});

test("the API can load without Cloudinary; body-only writes work and file uploads fail closed", async (t) => {
  const uploadApp = express();
  uploadApp.use(express.json());
  uploadApp.post("/upload", upload.single("image"), (req, res) => res.json({ received: Boolean(req.file), name: req.body?.name || "" }));
  uploadApp.use((error, req, res, next) => res.status(error.statusCode || 500).json({ success: false, message: error.message }));
  const uploadServer = createServer(uploadApp);
  uploadServer.listen(0, "127.0.0.1");
  await once(uploadServer, "listening");
  t.after(() => new Promise((resolve) => uploadServer.close(resolve)));
  const uploadUrl = `http://127.0.0.1:${uploadServer.address().port}/upload`;

  const fieldsOnly = new FormData();
  fieldsOnly.set("name", "Coast destination");
  const fieldsResponse = await fetch(uploadUrl, { method: "POST", body: fieldsOnly });
  assert.equal(fieldsResponse.status, 200);
  assert.equal((await fieldsResponse.json()).name, "Coast destination");

  const fileUpload = new FormData();
  fileUpload.set("image", new Blob(["image bytes"], { type: "image/png" }), "coast.png");
  const fileResponse = await fetch(uploadUrl, { method: "POST", body: fileUpload });
  assert.equal(fileResponse.status, 503);
  assert.match((await fileResponse.json()).message, /Cloudinary is not configured/);
});

test("server binds before an unavailable MongoDB connection fails", async (t) => {
  const runtime = await launchServer();
  t.after(() => { if (runtime.child.exitCode === null) runtime.child.kill("SIGTERM"); });

  const response = await fetch(`http://127.0.0.1:${runtime.port}/api/health`);
  const payload = await response.json();
  assert.equal(response.status, 503);
  assert.equal(payload.success, false);
  assert.equal(payload.status, "starting");
  assert.ok(["connecting", "disconnected"].includes(payload.database));

  const exit = await waitForChildExit(runtime.childExit, 5000);
  assert.equal(exit[0], 1);
});

test("a fresh MongoDB-backed server becomes healthy after its critical migration", { skip: !process.env.HEALTH_TEST_MONGODB_URI }, async (t) => {
  const testDatabaseUrl = new URL(process.env.HEALTH_TEST_MONGODB_URI);
  testDatabaseUrl.pathname = `/health_readiness_${process.pid}_${Date.now()}`;
  const runtime = await launchServer({
    MONGODB_URI: testDatabaseUrl.toString(),
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: "5000",
    MONGODB_STARTUP_MIGRATION_TIMEOUT_MS: "30000",
  });
  t.after(() => { if (runtime.child.exitCode === null) runtime.child.kill("SIGTERM"); });

  const baseUrl = `http://127.0.0.1:${runtime.port}`;
  const deadline = Date.now() + 35_000;
  let healthResponse;
  let healthPayload;
  while (Date.now() < deadline) {
    if (runtime.child.exitCode !== null) break;
    healthResponse = await fetch(`${baseUrl}/api/health`).catch(() => null);
    if (healthResponse) {
      healthPayload = await healthResponse.json();
      if (healthResponse.status === 200 && healthPayload.status === "healthy") break;
      assert.equal(healthResponse.status, 503, "startup failures must not masquerade as healthy");
      assert.equal(healthPayload.status, "starting", "critical startup failure must not be hidden");
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  assert.equal(healthResponse?.status, 200, "the API should become ready after database connection and index migration");
  assert.equal(healthPayload.success, true);
  assert.equal(healthPayload.database, "connected");
  const rootResponse = await fetch(`${baseUrl}/`);
  const rootPayload = await rootResponse.json();
  assert.equal(rootResponse.status, 200);
  assert.equal(rootPayload.message, "Travel API running successfully");

  runtime.child.kill("SIGTERM");
  const exit = await waitForChildExit(runtime.childExit, 5000);
  assert.equal(exit[0], 0);
});
