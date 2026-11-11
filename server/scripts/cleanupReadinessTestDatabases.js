/**
 * Purpose: cleanup Readiness Test Databases operational script. Main declarations: redact, assertTargets, clusterCollectionCount, main.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load node:fs/promises so this module can use its exported dependencies.
import fs from "node:fs/promises";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:url so this module can use its exported dependencies.
import { fileURLToPath } from "node:url";
// Load ../seeds/completeTestDemoSeed.js so this module can use its exported dependencies.
import { SEEDED_MODELS } from "../seeds/completeTestDemoSeed.js";

// Declare generatedName for use by the surrounding module or function.
const generatedName = /^hr_[0-9]+_[0-9]+_[a-f0-9]{8}$/;
// Declare reportPath for use by the surrounding module or function.
const reportPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../reports/readiness-database-cleanup.json");
// Declare redact for use by the surrounding module or function.
const redact = (error) => String(error?.message || "cleanup failed").replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "[MongoDB URI redacted]");
// Declare activeClient for use by the surrounding module or function.
let activeClient;

// Define assertTargets; its parameters and body implement this operation.
function assertTargets() {
  // Declare appUri for use by the surrounding module or function.
  const appUri = process.env.MONGODB_URI;
  // Declare testUri for use by the surrounding module or function.
  const testUri = process.env.HEALTH_TEST_MONGODB_URI;
  // Check the condition (!appUri || !testUri) and run the matching branch.
  if (!appUri || !testUri) throw new Error("MONGODB_URI and HEALTH_TEST_MONGODB_URI must be loaded from the application environment.");
  // Declare app for use by the surrounding module or function.
  const app = new URL(appUri);
  // Declare test for use by the surrounding module or function.
  const test = new URL(testUri);
  // Declare appDatabase for use by the surrounding module or function.
  const appDatabase = decodeURIComponent(app.pathname.replace(/^\//, "").split("/")[0] || "");
  // Declare testDatabase for use by the surrounding module or function.
  const testDatabase = decodeURIComponent(test.pathname.replace(/^\//, "").split("/")[0] || "");
  // Check the condition (appDatabase !== "husseindb" || testDatabase !== "global_tours_test" ||) and run the matching branch.
  if (appDatabase !== "husseindb" || testDatabase !== "global_tours_test" || app.hostname !== test.hostname) throw new Error("Readiness cleanup requires the configured application Atlas cluster, husseindb, and its global_tours_test source database.");
  // Check the condition (!app.hostname.endsWith(".mongodb.net")) and run the matching branch.
  if (!app.hostname.endsWith(".mongodb.net")) throw new Error("Readiness cleanup refuses a non-Atlas host.");
  // Return the object assembled below to the caller.
  return { appDatabase, testDatabase };
}

// Define clusterCollectionCount; its parameters and body implement this operation.
async function clusterCollectionCount(client, databases) {
  // Declare counts for use by the surrounding module or function.
  const counts = await Promise.all(databases.map(async ({ name }) => client.db(name).listCollections({}, { nameOnly: true }).toArray().then((items) => items.length)));
  // Return the result of counts.reduce() to the caller.
  return counts.reduce((sum, count) => sum + count, 0);
}

// Define main; its parameters and body implement this operation.
async function main() {
  // Declare { appDatabase, testDatabase } for use by the surrounding module or function.
  const { appDatabase, testDatabase } = assertTargets();
  // Perform the side effect or state update expressed on the following line.
  await import("../app.js");
  // Perform the side effect or state update expressed on the following line.
  activeClient = new mongoose.mongo.MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  // Perform the side effect or state update expressed on the following line.
  await activeClient.connect();
  // Declare client for use by the surrounding module or function.
  const client = activeClient;
  // Declare beforeDatabases for use by the surrounding module or function.
  const beforeDatabases = (await client.db("admin").admin().listDatabases({ nameOnly: true })).databases || [];
  // Declare beforeCount for use by the surrounding module or function.
  const beforeCount = await clusterCollectionCount(client, beforeDatabases);
  // Declare knownCollections for use by the surrounding module or function.
  const knownCollections = new Set([...SEEDED_MODELS, ...Object.values(mongoose.models)].map((model) => model.collection.collectionName));
  // Declare candidates for use by the surrounding module or function.
  const candidates = beforeDatabases.map(({ name }) => name).filter((name) => generatedName.test(name));
  // Declare validated for use by the surrounding module or function.
  const validated = [];

  // Repeat the enclosed work for each required iteration.
  for (const name of candidates) {
    // Perform the side effect or state update expressed on the following line.
    console.log(`Readiness cleanup inspection: ${name}`);
    // Check the condition (name === appDatabase || name === testDatabase || /prod|production|stag) and run the matching branch.
    if (name === appDatabase || name === testDatabase || /prod|production|stage|staging/i.test(name)) throw new Error(`Refusing a protected readiness database name: ${name}`);
    // Check the condition (!generatedName.test(name)) and run the matching branch.
    if (!generatedName.test(name)) throw new Error(`Refusing an unexpected database name: ${name}`);
    // Declare collections for use by the surrounding module or function.
    const collections = await client.db(name).listCollections({}, { nameOnly: true }).toArray();
    // Declare collectionResults for use by the surrounding module or function.
    const collectionResults = [];
    // Repeat the enclosed work for each required iteration.
    for (const { name: collectionName } of collections) {
      // Check the condition (!knownCollections.has(collectionName)) and run the matching branch.
      if (!knownCollections.has(collectionName)) throw new Error(`Readiness database ${name} contains unrecognized collection ${collectionName}; refusing cleanup.`);
      // Declare count for use by the surrounding module or function.
      const count = await client.db(name).collection(collectionName).countDocuments({});
      // Perform the side effect or state update expressed on the following line.
      collectionResults.push({ name: collectionName, documents: count });
      // Check the condition (count !== 0) and run the matching branch.
      if (count !== 0) throw new Error(`Readiness database ${name} contains documents; refusing cleanup because contents are not proven disposable.`);
    }
    // Perform the side effect or state update expressed on the following line.
    validated.push({ name, collectionCount: collections.length, collections: collectionResults, classification: "EMPTY TEST database generated by healthReadiness.test.js" });
  }

  // Repeat the enclosed work for each required iteration.
  for (const item of validated) {
    // Check the condition (!generatedName.test(item.name) || item.name === appDatabase || item.na) and run the matching branch.
    if (!generatedName.test(item.name) || item.name === appDatabase || item.name === testDatabase) throw new Error(`Readiness database changed validation state: ${item.name}`);
    // Perform the side effect or state update expressed on the following line.
    console.log(`Removing confirmed empty readiness-test collections from: ${item.name} (${item.collectionCount} app-schema collections)`);
    // Repeat the enclosed work for each required iteration.
    for (const collection of item.collections) {
      // Check the condition (collection.documents !== 0 || !knownCollections.has(collection.name)) and run the matching branch.
      if (collection.documents !== 0 || !knownCollections.has(collection.name)) throw new Error(`Readiness collection changed validation state: ${item.name}.${collection.name}`);
      // Perform the side effect or state update expressed on the following line.
      await client.db(item.name).collection(collection.name).drop();
    }
  }

  // Declare afterDatabases for use by the surrounding module or function.
  const afterDatabases = (await client.db("admin").admin().listDatabases({ nameOnly: true })).databases || [];
  // Declare afterCount for use by the surrounding module or function.
  const afterCount = await clusterCollectionCount(client, afterDatabases);
  // Declare remaining for use by the surrounding module or function.
  const remaining = afterDatabases.map(({ name }) => name).filter((name) => generatedName.test(name));
  // Check the condition (remaining.length) and run the matching branch.
  if (remaining.length) throw new Error(`Readiness-test databases remain after cleanup: ${remaining.length}`);
  // Declare report for use by the surrounding module or function.
  const report = { timestamp: new Date().toISOString(), applicationDatabase: appDatabase, testSourceDatabase: testDatabase, clusterCollectionsBefore: beforeCount, clusterCollectionsAfter: afterCount, atlasLimit: 500, removedDatabaseCount: validated.length, removedCollectionCount: validated.reduce((sum, item) => sum + item.collectionCount, 0), removedDatabases: validated };
  // Perform the side effect or state update expressed on the following line.
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  // Perform the side effect or state update expressed on the following line.
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({ clusterCollectionsBefore: beforeCount, clusterCollectionsAfter: afterCount, removedDatabaseCount: validated.length, removedCollectionCount: report.removedCollectionCount, report: "reports/readiness-database-cleanup.json" }, null, 2));
  // Perform the side effect or state update expressed on the following line.
  await activeClient.close();
  // Perform the side effect or state update expressed on the following line.
  activeClient = null;
}

// Perform the side effect or state update expressed on the following line.
main().catch((error) => {
  // Perform the side effect or state update expressed on the following line.
  console.error(`Confirmed readiness cleanup failed: ${redact(error)}`);
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
}).finally(async () => {
  // Perform the side effect or state update expressed on the following line.
  await activeClient?.close();
});
