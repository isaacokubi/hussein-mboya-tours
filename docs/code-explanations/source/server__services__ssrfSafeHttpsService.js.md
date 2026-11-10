# Source explanation: server/services/ssrfSafeHttpsService.js

**Source:** [server/services/ssrfSafeHttpsService.js](../../../server/services/ssrfSafeHttpsService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `https` from `https`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dns` from `dns/promises`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `net` from `net`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `isPrivateAddress` — lines 7–17

Parameters: `address`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `if (net.isIPv4(address)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 9:** `const [a, b] = address.split(".").map(Number);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 0 || b === 168)) || (a === 198 && (b === 18 || b === ` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 12:** `if (net.isIPv6(address)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `const value = address.toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `return value === "::" || value === "::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:") || value.startsWith("ff");` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 16:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `resolvePublicAddress` — lines 19–25

Parameters: `hostname`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `const records = net.isIP(hostname)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (!records.length || records.some(({ address }) => isPrivateAddress(address))) throw new Error("Webhook URL resolves to a private or local address.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `return records[0];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `postJsonToPinnedHttpsUrl` — lines 27–65

Parameters: `rawUrl`, `body`, `options (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 28:** `const parsed = new URL(String(rawUrl || ""));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (parsed.protocol !== "https:") throw new Error("Webhook URL must use HTTPS.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const { address, family } = await resolvePublicAddress(hostname);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `const timeoutMs = Number(options.timeoutMs || 10000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const headers = { ...(options.headers || {}), "content-length": Buffer.byteLength(body, "utf8") };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `return new Promise((resolve, reject) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 36:** `const request = https.request({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const chunks = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `let size = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `if (size <= MAX_RESPONSE_BYTES) chunks.push(chunk);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `else request.destroy(new Error("Webhook response exceeds the maximum allowed size."));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const responseText = Buffer.concat(chunks).toString("utf8");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 5: `const MAX_RESPONSE_BYTES = 256 * 1024;`.
- Line 7: `const isPrivateAddress = (address) => {`.
- Line 9: `const [a, b] = address.split(".").map(Number);`.
- Line 13: `const value = address.toLowerCase();`.
- Line 19: `const resolvePublicAddress = async (hostname) => {`.
- Line 20: `const records = net.isIP(hostname)`.
- Line 28: `const parsed = new URL(String(rawUrl || ""));`.
- Line 30: `const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();`.
- Line 31: `const { address, family } = await resolvePublicAddress(hostname);`.
- Line 32: `const timeoutMs = Number(options.timeoutMs || 10000);`.
- Line 33: `const headers = { ...(options.headers || {}), "content-length": Buffer.byteLength(body, "utf8") };`.
- Line 36: `const request = https.request({`.
- Line 47: `const chunks = [];`.
- Line 48: `let size = 0;`.
- Line 55: `const responseText = Buffer.concat(chunks).toString("utf8");`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
