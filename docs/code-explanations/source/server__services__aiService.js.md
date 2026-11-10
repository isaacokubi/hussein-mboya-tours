# Source explanation: server/services/aiService.js

**Source:** [server/services/aiService.js](../../../server/services/aiService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `OpenAI` from `openai`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `env` from `../config/env.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/env.js](../../../server/config/env.js)
- `formatTravelKnowledge` from `./aiKnowledgeFormatter.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/aiKnowledgeFormatter.js](../../../server/services/aiKnowledgeFormatter.js)
- `searchRelevantTours` from `./aiTourSearchService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/aiTourSearchService.js](../../../server/services/aiTourSearchService.js)
- `createAIBookingDraft` from `./aiBookingDraftService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/aiBookingDraftService.js](../../../server/services/aiBookingDraftService.js)
- `detectIntent` from `./aiIntentService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/aiIntentService.js](../../../server/services/aiIntentService.js)

## Runtime declarations and data flow

### `generateTravelAdvice` — lines 17–172

Parameters: `message`, `user (defaulted)`.
4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `const settings = await getSystemSettings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `const companyName = settings.companyName || "Company";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const intent = detectIntent(message);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const bookingIntent = /book|booking|reserve|reservation/i.test(message);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (bookingIntent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `const bookingDraft = await createAIBookingDraft(message, user);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `if (bookingDraft) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `return \`` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 56:** `const relevantTours = await searchRelevantTours(message);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 57:** `const travelKnowledge = formatTravelKnowledge({ tours: relevantTours, destinations: [] });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 60:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `const response = await client.responses.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 72:** `return response.output_text;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 76:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 77:** `const fallbackTours = relevantTours;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `const lowerMessage = message.toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `if (lowerMessage.includes("book") || lowerMessage.includes("booking") || lowerMessage.includes("reserve")) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 15: `<sensitive declaration redacted>`.
- Line 17: `export const generateTravelAdvice = async (message, user = null) => {`.
- Line 20: `const settings = await getSystemSettings();`.
- Line 21: `const companyName = settings.companyName || "Company";`.
- Line 22: `const intent = detectIntent(message);`.
- Line 23: `const bookingIntent = /book|booking|reserve|reservation/i.test(message);`.
- Line 26: `const bookingDraft = await createAIBookingDraft(message, user);`.
- Line 56: `const relevantTours = await searchRelevantTours(message);`.
- Line 57: `const travelKnowledge = formatTravelKnowledge({ tours: relevantTours, destinations: [] });`.
- Line 62: `const response = await client.responses.create({`.
- Line 77: `const fallbackTours = relevantTours;`.
- Line 78: `const lowerMessage = message.toLowerCase();`.
- Line 81: `const selectedTour = fallbackTours[0];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
