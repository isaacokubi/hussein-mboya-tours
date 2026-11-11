/**
 * Purpose: verify Demo Image Assets operational script. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import fs from "node:fs/promises";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:url so this module can use its exported dependencies.
import { fileURLToPath } from "node:url";

// Declare here for use by the surrounding module or function.
const here = path.dirname(fileURLToPath(import.meta.url));
// Declare reportPath for use by the surrounding module or function.
const reportPath = path.resolve(here, "../reports/demo-image-validation.json");
// Declare seed for use by the surrounding module or function.
const seed = await fs.readFile(path.resolve(here, "../seeds/completeTestDemoSeed.js"), "utf8");
// Declare match for use by the surrounding module or function.
const match = seed.match(/const unsplashAssetIds = \[(.*?)\];/s);
// Check the condition (!match) and run the matching branch.
if (!match) throw new Error("The seed's verified image catalog was not found.");
// Declare ids for use by the surrounding module or function.
const ids = [...match[1].matchAll(/"(photo-[A-Za-z0-9-]+)"/g)].map((item) => item[1]);
// Check the condition (ids.length !== 29 || new Set(ids).size !== 29) and run the matching branch.
if (ids.length !== 29 || new Set(ids).size !== 29) throw new Error(`Expected 29 unique remote image assets; found ${ids.length}.`);
// Declare publicDirectory for use by the surrounding module or function.
const publicDirectory = path.resolve(here, "../../client/public");
// Declare localAssets for use by the surrounding module or function.
const localAssets = [
  "destinations/maasai-mara.jpg", "destinations/amboseli.jpg", "destinations/diani.jpg",
  "gallery/mara.jpg", "gallery/amboseli.jpg", "gallery/diani.jpg", "gallery/beach.jpg",
  "gallery/culture.jpg", "gallery/safari.jpg", "hero1.jpeg", "hero2.jpeg", "hero4.jpeg",
  ...Array.from({ length: 18 }, (_, index) => `demo-destinations/kenya-landscape-${String(index + 1).padStart(2, "0")}.svg`),
  "demo-tours/kenya-tour-08.svg",
];
// Repeat the enclosed work for each required iteration.
for (const asset of localAssets) await fs.access(path.join(publicDirectory, asset));
// Declare results for use by the surrounding module or function.
const results = await Promise.all(ids.map(async (id) => {
  // Declare response for use by the surrounding module or function.
  const response = await fetch(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`, { method: "HEAD", signal: AbortSignal.timeout(15000) });
  // Return the object assembled below to the caller.
  return { id, status: response.status };
}));
// Declare failures for use by the surrounding module or function.
const failures = results.filter(({ status }) => status !== 200);
// Declare report for use by the surrounding module or function.
const report = { timestamp: new Date().toISOString(), remoteAssets: ids.length, remoteAssetsVerified: results.length - failures.length, localAssets: localAssets.length, failures };
// Perform the side effect or state update expressed on the following line.
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
// Perform the side effect or state update expressed on the following line.
console.log(JSON.stringify({ ...report, report: "reports/demo-image-validation.json" }, null, 2));
// Check the condition (failures.length) and run the matching branch.
if (failures.length) process.exitCode = 1;
