import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const reportPath = path.resolve(here, "../reports/demo-image-validation.json");
const seed = await fs.readFile(path.resolve(here, "../seeds/completeTestDemoSeed.js"), "utf8");
const match = seed.match(/const unsplashAssetIds = \[(.*?)\];/s);
if (!match) throw new Error("The seed's verified image catalog was not found.");
const ids = [...match[1].matchAll(/"(photo-[A-Za-z0-9-]+)"/g)].map((item) => item[1]);
if (ids.length !== 29 || new Set(ids).size !== 29) throw new Error(`Expected 29 unique remote image assets; found ${ids.length}.`);
const publicDirectory = path.resolve(here, "../../client/public");
const localAssets = [
  "destinations/maasai-mara.jpg", "destinations/amboseli.jpg", "destinations/diani.jpg",
  "gallery/mara.jpg", "gallery/amboseli.jpg", "gallery/diani.jpg", "gallery/beach.jpg",
  "gallery/culture.jpg", "gallery/safari.jpg", "hero1.jpeg", "hero2.jpeg", "hero4.jpeg",
  ...Array.from({ length: 18 }, (_, index) => `demo-destinations/kenya-landscape-${String(index + 1).padStart(2, "0")}.svg`),
  "demo-tours/kenya-tour-08.svg",
];
for (const asset of localAssets) await fs.access(path.join(publicDirectory, asset));
const results = await Promise.all(ids.map(async (id) => {
  const response = await fetch(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`, { method: "HEAD", signal: AbortSignal.timeout(15000) });
  return { id, status: response.status };
}));
const failures = results.filter(({ status }) => status !== 200);
const report = { timestamp: new Date().toISOString(), remoteAssets: ids.length, remoteAssetsVerified: results.length - failures.length, localAssets: localAssets.length, failures };
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
console.log(JSON.stringify({ ...report, report: "reports/demo-image-validation.json" }, null, 2));
if (failures.length) process.exitCode = 1;
