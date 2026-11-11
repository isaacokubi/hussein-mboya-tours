/**
 * Purpose: health Readiness.test automated test. Main declarations: startApp, launchServer, findPort, waitForChildExit.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:http so this module can use its exported dependencies.
import { createServer } from "node:http";
// Load node:events so this module can use its exported dependencies.
import { once } from "node:events";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";

// Keep this runtime test independent of a developer's ignored .env file.
// app.js calls dotenv.config(), so capture opt-in state before importing it.
// Declare healthTestMongoUri for use by the surrounding module or function.
const healthTestMongoUri = process.env.HEALTH_TEST_MONGODB_URI;
// Perform the side effect or state update expressed on the following line.
process.env.NODE_ENV = "test";
// Perform the side effect or state update expressed on the following line.
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/health_readiness_test";
// Perform the side effect or state update expressed on the following line.
process.env.JWT_SECRET = "ci-only-test-secret";
// Repeat the enclosed work for each required iteration.
for (const key of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) process.env[key] = "";

// Declare [{ default: mongoose }, { default: app }, { setStartupPhase }, { default: upload }] for use by the surrounding module or function.
const [{ default: mongoose }, { default: app }, { setStartupPhase }, { default: upload }] = await Promise.all([
  import("mongoose"),
  import("../app.js"),
  import("../startup/readiness.js"),
  import("../middleware/uploadMiddleware.js"),
]);

// Declare startApp for use by the surrounding module or function.
const startApp = async () => {
  // Declare server for use by the surrounding module or function.
  const server = createServer(app);
  // Perform the side effect or state update expressed on the following line.
  server.listen(0, "127.0.0.1");
  // Perform the side effect or state update expressed on the following line.
  await once(server, "listening");
  // Declare address for use by the surrounding module or function.
  const address = server.address();
  // Return the object assembled below to the caller.
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
};

// Declare launchServer for use by the surrounding module or function.
const launchServer = async (overrides = {}) => {
  // Declare { spawn } for use by the surrounding module or function.
  const { spawn } = await import("node:child_process");
  // Declare { fileURLToPath } for use by the surrounding module or function.
  const { fileURLToPath } = await import("node:url");
  // Declare { dirname, resolve } for use by the surrounding module or function.
  const { dirname, resolve } = await import("node:path");
  // Declare serverDirectory for use by the surrounding module or function.
  const serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  // Declare child for use by the surrounding module or function.
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
  // Declare childExit for use by the surrounding module or function.
  const childExit = once(child, "exit");
  // Declare output for use by the surrounding module or function.
  let output = "";
  // Perform the side effect or state update expressed on the following line.
  child.stdout.setEncoding("utf8").on("data", (chunk) => { output += chunk; });
  // Perform the side effect or state update expressed on the following line.
  child.stderr.setEncoding("utf8").on("data", (chunk) => { output += chunk; });

  // Declare port for use by the surrounding module or function.
  let port;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    port = await new Promise((resolvePort, reject) => {
      // Importing the complete production route graph can take several seconds
      // in parallel CI runs; keep this bounded without masking listener errors.
      // Declare timeout for use by the surrounding module or function.
      const timeout = setTimeout(() => reject(new Error(`HTTP listener did not start promptly. Output: ${output}`)), 30_000);
      // Declare findPort for use by the surrounding module or function.
      const findPort = () => {
        // Declare match for use by the surrounding module or function.
        const match = output.match(/HTTP server listening on port (\d+)/);
        // Check the condition (!match) and run the matching branch.
        if (!match) return false;
        // Perform the side effect or state update expressed on the following line.
        clearTimeout(timeout);
        // Perform the side effect or state update expressed on the following line.
        resolvePort(Number(match[1]));
        // Return the expression shown below to the caller.
        return true;
      };
      // Perform the side effect or state update expressed on the following line.
      child.stdout.on("data", findPort);
      // Perform the side effect or state update expressed on the following line.
      child.stderr.on("data", findPort);
      // Perform the side effect or state update expressed on the following line.
      child.once("error", (error) => { clearTimeout(timeout); reject(error); });
      // Perform the side effect or state update expressed on the following line.
      child.once("exit", (code) => {
        // Check the condition (!findPort()) and run the matching branch.
        if (!findPort()) {
          // Perform the side effect or state update expressed on the following line.
          clearTimeout(timeout);
          // Perform the side effect or state update expressed on the following line.
          reject(new Error(`Server exited before listening (code ${code}). Output: ${output}`));
        }
      });
    });
  } catch (error) {
    // Check the condition (child.exitCode === null) and run the matching branch.
    if (child.exitCode === null) child.kill("SIGTERM");
    // Stop the current operation by raising the value of error.
    throw error;
  }

  // Return the object assembled below to the caller.
  return { child, childExit, port, output: () => output };
};

// Declare waitForChildExit for use by the surrounding module or function.
const waitForChildExit = (childExit, timeoutMs) => new Promise((resolveExit, reject) => {
  // Declare timeout for use by the surrounding module or function.
  const timeout = setTimeout(() => reject(new Error("Server process did not exit within its configured timeout.")), timeoutMs);
  // Perform the side effect or state update expressed on the following line.
  childExit.then((result) => { clearTimeout(timeout); resolveExit(result); }, (error) => { clearTimeout(timeout); reject(error); });
});

// Perform the side effect or state update expressed on the following line.
test("health and root routes stay reachable and report real database readiness", async (t) => {
  // Check the condition (mongoose.connection.readyState !== 0) and run the matching branch.
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  // Declare { server, baseUrl } for use by the surrounding module or function.
  const { server, baseUrl } = await startApp();
  // Perform the side effect or state update expressed on the following line.
  t.after(async () => {
    // Check the condition (mongoose.connection.readyState !== 0) and run the matching branch.
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    // Perform the side effect or state update expressed on the following line.
    await new Promise((resolve) => server.close(resolve));
  });

  // Perform the side effect or state update expressed on the following line.
  setStartupPhase("starting");
  // Declare response for use by the surrounding module or function.
  let response = await fetch(`${baseUrl}/api/live`);
  // Declare payload for use by the surrounding module or function.
  let payload = await response.json();
  // Perform the side effect or state update expressed on the following line.
  assert.equal(response.status, 200, "liveness stays successful while infrastructure is unavailable");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.status, "alive");

  // Perform the side effect or state update expressed on the following line.
  response = await fetch(`${baseUrl}/api/health`);
  // Perform the side effect or state update expressed on the following line.
  payload = await response.json();
  // Perform the side effect or state update expressed on the following line.
  assert.equal(response.status, 503);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.success, false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.status, "starting");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.database, "disconnected");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.databaseName, null);

  // Perform the side effect or state update expressed on the following line.
  response = await fetch(`${baseUrl}/api/ready`);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(response.status, 503);
  // Perform the side effect or state update expressed on the following line.
  assert.equal((await response.json()).database, "disconnected");

  // Perform the side effect or state update expressed on the following line.
  setStartupPhase("ready");
  // Perform the side effect or state update expressed on the following line.
  response = await fetch(`${baseUrl}/api/health`);
  // Perform the side effect or state update expressed on the following line.
  payload = await response.json();
  // Perform the side effect or state update expressed on the following line.
  assert.equal(response.status, 503);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.success, false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.status, "degraded");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.database, "disconnected");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.databaseName, null);

  // Perform the side effect or state update expressed on the following line.
  response = await fetch(`${baseUrl}/api/users`);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(response.status, 503, "database-backed routes fail promptly while unavailable");

  // Perform the side effect or state update expressed on the following line.
  response = await fetch(`${baseUrl}/`);
  // Perform the side effect or state update expressed on the following line.
  payload = await response.json();
  // Perform the side effect or state update expressed on the following line.
  assert.equal(response.status, 200);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.message, "Travel API running successfully");
});

// Perform the side effect or state update expressed on the following line.
test("the API can load without Cloudinary; body-only writes work and file uploads fail closed", async (t) => {
  // Declare uploadApp for use by the surrounding module or function.
  const uploadApp = express();
  // Perform the side effect or state update expressed on the following line.
  uploadApp.use(express.json());
  // Perform the side effect or state update expressed on the following line.
  uploadApp.post("/upload", upload.single("image"), (req, res) => res.json({ received: Boolean(req.file), name: req.body?.name || "" }));
  // Perform the side effect or state update expressed on the following line.
  uploadApp.use((error, req, res, next) => res.status(error.statusCode || 500).json({ success: false, message: error.message }));
  // Declare uploadServer for use by the surrounding module or function.
  const uploadServer = createServer(uploadApp);
  // Perform the side effect or state update expressed on the following line.
  uploadServer.listen(0, "127.0.0.1");
  // Perform the side effect or state update expressed on the following line.
  await once(uploadServer, "listening");
  // Perform the side effect or state update expressed on the following line.
  t.after(() => new Promise((resolve) => uploadServer.close(resolve)));
  // Declare uploadUrl for use by the surrounding module or function.
  const uploadUrl = `http://127.0.0.1:${uploadServer.address().port}/upload`;

  // Declare fieldsOnly for use by the surrounding module or function.
  const fieldsOnly = new FormData();
  // Perform the side effect or state update expressed on the following line.
  fieldsOnly.set("name", "Coast destination");
  // Declare fieldsResponse for use by the surrounding module or function.
  const fieldsResponse = await fetch(uploadUrl, { method: "POST", body: fieldsOnly });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(fieldsResponse.status, 200);
  // Perform the side effect or state update expressed on the following line.
  assert.equal((await fieldsResponse.json()).name, "Coast destination");

  // Declare fileUpload for use by the surrounding module or function.
  const fileUpload = new FormData();
  // Perform the side effect or state update expressed on the following line.
  fileUpload.set("image", new Blob(["image bytes"], { type: "image/png" }), "coast.png");
  // Declare fileResponse for use by the surrounding module or function.
  const fileResponse = await fetch(uploadUrl, { method: "POST", body: fileUpload });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(fileResponse.status, 503);
  // Perform the side effect or state update expressed on the following line.
  assert.match((await fileResponse.json()).message, /Cloudinary is not configured/);
});

// Perform the side effect or state update expressed on the following line.
test("server remains live and retries while MongoDB is unavailable", async (t) => {
  // Declare runtime for use by the surrounding module or function.
  const runtime = await launchServer();
  // Perform the side effect or state update expressed on the following line.
  t.after(() => { if (runtime.child.exitCode === null) runtime.child.kill("SIGTERM"); });

  // Declare baseUrl for use by the surrounding module or function.
  const baseUrl = `http://127.0.0.1:${runtime.port}`;
  // Declare response for use by the surrounding module or function.
  const response = await fetch(`${baseUrl}/api/health`);
  // Declare payload for use by the surrounding module or function.
  const payload = await response.json();
  // Perform the side effect or state update expressed on the following line.
  assert.equal(response.status, 503);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.success, false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.status, "starting");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(["connecting", "disconnected"].includes(payload.database));

  // Declare liveResponse for use by the surrounding module or function.
  const liveResponse = await fetch(`${baseUrl}/api/live`);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(liveResponse.status, 200);
  // Perform the side effect or state update expressed on the following line.
  assert.equal((await liveResponse.json()).status, "alive");
  // Perform the side effect or state update expressed on the following line.
  await new Promise((resolve) => setTimeout(resolve, 100));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(runtime.child.exitCode, null, "database outage must not terminate the HTTP process");
});

// Perform the side effect or state update expressed on the following line.
test("a fresh MongoDB-backed server becomes healthy after its critical migration", { skip: !healthTestMongoUri }, async (t) => {
  // Declare testDatabaseUrl for use by the surrounding module or function.
  const testDatabaseUrl = new URL(healthTestMongoUri);
  // Declare sourceDatabase for use by the surrounding module or function.
  const sourceDatabase = decodeURIComponent(testDatabaseUrl.pathname.replace(/^\//, ""));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(sourceDatabase, "global_tours_test", "health readiness must derive its isolated database from the Atlas test database");
  // Declare databaseName for use by the surrounding module or function.
  const databaseName = `hr_${process.pid}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
  // Perform the side effect or state update expressed on the following line.
  testDatabaseUrl.pathname = `/${databaseName}`;
  // Perform the side effect or state update expressed on the following line.
  assert.match(databaseName, /^hr_[0-9]+_[0-9]+_[a-f0-9]{8}$/);
  // Declare isolatedMongoUri for use by the surrounding module or function.
  const isolatedMongoUri = testDatabaseUrl.toString();
  // Declare runtime for use by the surrounding module or function.
  const runtime = await launchServer({
    MONGODB_URI: isolatedMongoUri,
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: "5000",
    MONGODB_STARTUP_MIGRATION_TIMEOUT_MS: "60000",
    NODE_OPTIONS: [process.env.NODE_OPTIONS, `--import=${new URL("./disableMongoAutoIndexForStartupTest.mjs", import.meta.url).href}`].filter(Boolean).join(" "),
  });
  // Perform the side effect or state update expressed on the following line.
  t.after(async () => {
    // Check the condition (runtime.child.exitCode === null) and run the matching branch.
    if (runtime.child.exitCode === null) runtime.child.kill("SIGTERM");
    // Declare { default: cleanupMongoose } for use by the surrounding module or function.
    const { default: cleanupMongoose } = await import("mongoose");
    // Declare cleanupClient for use by the surrounding module or function.
    const cleanupClient = new cleanupMongoose.mongo.MongoClient(isolatedMongoUri, { serverSelectionTimeoutMS: 10_000 });
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      await cleanupClient.connect();
      // Declare cleanupDatabase for use by the surrounding module or function.
      const cleanupDatabase = cleanupClient.db(databaseName);
      // Check the condition (cleanupDatabase.databaseName !== databaseName) and run the matching branch.
      if (cleanupDatabase.databaseName !== databaseName) throw new Error("Refusing to clean an unexpected health readiness database.");
      // Check the condition (!/^hr_[0-9]+_[0-9]+_[a-f0-9]{8}$/.test(databaseName)) and run the matching branch.
      if (!/^hr_[0-9]+_[0-9]+_[a-f0-9]{8}$/.test(databaseName)) throw new Error("Refusing to clean a database outside the health-readiness test namespace.");
      // Declare knownCollections for use by the surrounding module or function.
      const knownCollections = new Set(Object.values(cleanupMongoose.models).map((model) => model.collection.collectionName));
      // Declare collections for use by the surrounding module or function.
      const collections = await cleanupDatabase.listCollections({}, { nameOnly: true }).toArray();
      // Repeat the enclosed work for each required iteration.
      for (const { name } of collections) {
        // Check the condition (!knownCollections.has(name)) and run the matching branch.
        if (!knownCollections.has(name)) throw new Error(`Refusing to remove unknown readiness collection ${name}.`);
        // Perform the side effect or state update expressed on the following line.
        await cleanupDatabase.collection(name).drop();
      }
      // Declare remaining for use by the surrounding module or function.
      const remaining = await cleanupDatabase.listCollections({}, { nameOnly: true }).toArray();
      // Perform the side effect or state update expressed on the following line.
      assert.equal(remaining.length, 0, "the isolated readiness test database must be empty after teardown");
    } finally {
      // Perform the side effect or state update expressed on the following line.
      await cleanupClient.close();
    }
  });

  // Declare baseUrl for use by the surrounding module or function.
  const baseUrl = `http://127.0.0.1:${runtime.port}`;
  // Declare deadline for use by the surrounding module or function.
  const deadline = Date.now() + 75_000;
  // Declare healthResponse for use by the surrounding module or function.
  let healthResponse;
  // Declare healthPayload for use by the surrounding module or function.
  let healthPayload;
  // Repeat the enclosed work for each required iteration.
  while (Date.now() < deadline) {
    // Check the condition (runtime.child.exitCode !== null) and run the matching branch.
    if (runtime.child.exitCode !== null) break;
    // Perform the side effect or state update expressed on the following line.
    healthResponse = await fetch(`${baseUrl}/api/health`).catch(() => null);
    // Check the condition (healthResponse) and run the matching branch.
    if (healthResponse) {
      // Perform the side effect or state update expressed on the following line.
      healthPayload = await healthResponse.json();
      // Check the condition (healthResponse.status === 200 && healthPayload.status === "healthy") and run the matching branch.
      if (healthResponse.status === 200 && healthPayload.status === "healthy") break;
      // Perform the side effect or state update expressed on the following line.
      assert.equal(healthResponse.status, 503, "startup failures must not masquerade as healthy");
      // Perform the side effect or state update expressed on the following line.
      assert.ok(["starting", "degraded"].includes(healthPayload.status), "critical startup failure must remain non-ready while retrying");
      // Perform the side effect or state update expressed on the following line.
      assert.ok(["starting", "failed"].includes(healthPayload.startup));
    }
    // Perform the side effect or state update expressed on the following line.
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Perform the side effect or state update expressed on the following line.
  assert.equal(healthResponse?.status, 200, `the API should become ready after database connection and index migration. Startup output: ${runtime.output()}`);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(healthPayload.success, true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(healthPayload.database, "connected");
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(isolatedMongoUri, { serverSelectionTimeoutMS: 10_000 });
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare invoiceIndexes for use by the surrounding module or function.
    const invoiceIndexes = await mongoose.connection.db.collection("invoices").indexes();
    // Perform the side effect or state update expressed on the following line.
    assert.ok(invoiceIndexes.some((index) => index.name === "tenantId_1_booking_1" && index.unique === true));
    // Perform the side effect or state update expressed on the following line.
    assert.ok(invoiceIndexes.some((index) => index.name === "tenantId_1_hospitalityBooking_1_hospitalityType_1" && index.unique === true));
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.disconnect();
  }
  // Declare rootResponse for use by the surrounding module or function.
  const rootResponse = await fetch(`${baseUrl}/`);
  // Declare rootPayload for use by the surrounding module or function.
  const rootPayload = await rootResponse.json();
  // Perform the side effect or state update expressed on the following line.
  assert.equal(rootResponse.status, 200);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(rootPayload.message, "Travel API running successfully");

  // Perform the side effect or state update expressed on the following line.
  runtime.child.kill("SIGTERM");
  // Declare exit for use by the surrounding module or function.
  const exit = await waitForChildExit(runtime.childExit, 15_000);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(exit[0], 0);
});
