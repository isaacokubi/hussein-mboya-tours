# Source explanation: server/scripts/verifyDemoImageAssets.js

**Source:** [server/scripts/verifyDemoImageAssets.js](../../../server/scripts/verifyDemoImageAssets.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `fs` from `node:fs/promises`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fileURLToPath` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 5: `const here = path.dirname(fileURLToPath(import.meta.url));`.
- Line 6: `const reportPath = path.resolve(here, "../reports/demo-image-validation.json");`.
- Line 7: `const seed = await fs.readFile(path.resolve(here, "../seeds/completeTestDemoSeed.js"), "utf8");`.
- Line 8: `const match = seed.match(/const unsplashAssetIds = \[(.*?)\];/s);`.
- Line 10: `const ids = [...match[1].matchAll(/"(photo-[A-Za-z0-9-]+)"/g)].map((item) => item[1]);`.
- Line 12: `const publicDirectory = path.resolve(here, "../../client/public");`.
- Line 13: `const localAssets = [`.
- Line 21: `const results = await Promise.all(ids.map(async (id) => {`.
- Line 22: `const response = await fetch(\`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85\`, { method: "HEAD", signal: AbortSignal.timeout(15000) });`.
- Line 25: `const failures = results.filter(({ status }) => status !== 200);`.
- Line 26: `const report = { timestamp: new Date().toISOString(), remoteAssets: ids.length, remoteAssetsVerified: results.length - failures.length, localAssets: localAssets.length, failures };`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
