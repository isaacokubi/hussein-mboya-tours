# Source explanation: server/controllers/tourController.js

**Source:** [server/controllers/tourController.js](../../../server/controllers/tourController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `getTenantContext`, `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `cancelTourAndBookings` from `../services/tourCancellationService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tourCancellationService.js](../../../server/services/tourCancellationService.js)

## Runtime declarations and data flow

### `attachAvailability` — lines 16–21

Parameters: `tourLike`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 17:** `const totalSlots = Number(tourLike?.availabilitySettings?.totalSlots ?? tourLike?.capacity ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const bookedSlots = Math.max(0, Number(tourLike?.availabilitySettings?.bookedSlots ?? 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const availableSlots = Math.max(totalSlots - bookedSlots, 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `return { ...tourLike, totalSlots, bookedSlots, availableSlots, isFull: availableSlots === 0 };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `withPublicTourContext` — lines 25–29

Parameters: `callback`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `const context = getTenantContext();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `if (context.bypass === true) return callback(true);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `return callback(false);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `normalizeDestinationId` — lines 31–34

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 32:** `if (!value || !String(value).trim()) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `return String(value).trim();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `categoryFilter` — lines 36–39

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `escapeRegex` — lines 41–41

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `parsePage` — lines 43–46

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 44:** `const page = Number(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `return Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10_000) : 1;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `parsePageSize` — lines 47–50

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 48:** `const size = Number(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `return Number.isSafeInteger(size) ? Math.min(Math.max(size, 1), 24) : fallback;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ensureDestination` — lines 52–57

Parameters: `destinationId`, `tenantId`.
Persistent operations detected: Destination.findOne; verify tenant/ownership filters in the exact query. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 53:** `const id = normalizeDestinationId(destinationId);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `if (!id) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `const filter = tenantId ? mergeTenantFilter({ _id: id }) : { _id: id };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `return Destination.findOne(filter).lean();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `hasRealTourImage` — lines 59–67

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 60:** `const values = [tour?.featuredImage, ...(Array.isArray(tour?.gallery) ? tour.gallery : [])];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `return values.some((item) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 62:** `const url = typeof item === "string" ? item : item?.url;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `if (!url) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `const normalized = String(url).toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `return !normalized.includes("image-placeholder") && !normalized.endsWith("/hero1.jpeg");` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTours` — lines 69–108

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Tour.find, Tour.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 70:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 71:** `return await withPublicTourContext(async (platformWide) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 72:** `const { page = 1, limit = 12, search, destination, category, featured, duration, travellers, sort } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `const filter = platformWide ? { ...publicTourFilter } : mergeTenantFilter({ ...publicTourFilter });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `if (destination) filter.destination = destination;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 75:** `if (category) filter.category = categoryFilter(category);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** `if (featured === "true") filter.featured = true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** `if (typeof search === "string" && search.trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `const keyword = escapeRegex(search.trim().slice(0, 120));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `if (duration === "1-3") filter.durationDays = { $gte: 1, $lte: 3 };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 86:** `else if (duration === "4-6") filter.durationDays = { $gte: 4, $lte: 6 };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `else if (duration === "7+") filter.durationDays = { $gte: 7 };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `const partySize = Number(travellers);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 89:** `if (Number.isInteger(partySize) && partySize > 0 && partySize <= 100) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 92:** `const currentPage = parsePage(page);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `const pageSize = parsePageSize(limit);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const skip = (currentPage - 1) * pageSize;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 95:** `const sortBy = sort === "price-asc" ? { price: 1, createdAt: -1 }` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getFeaturedTours` — lines 110–118

Parameters: `req`, `res`, `next`.
Persistent operations detected: Tour.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 111:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 112:** `return await withPublicTourContext(async (platformWide) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 113:** `const filter = platformWide ? { ...publicTourFilter, featured: true } : mergeTenantFilter({ ...publicTourFilter, featured: true });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 114:** `const tours = await Tour.find(filter).select(publicListFields).slice("images", 1).slice("gallery", 1).populate({ path: "destination", select: "name slug country" }).sort({ popularity: -1, createdAt: -1 }).limit(6).lean()` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 115:** `return res.json({ success: true, data: tours.map((tour) => ({ ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) })) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `searchTours` — lines 120–143

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Tour.find, Tour.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 121:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 122:** `return await withPublicTourContext(async (platformWide) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 123:** `const { keyword, search, category, country, destination, page = 1, limit = 12 } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 124:** `const filter = platformWide ? { ...publicTourFilter } : mergeTenantFilter({ ...publicTourFilter });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 125:** `const term = keyword || search;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `if (term) filter.$or = [` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 131:** `if (category) filter.category = categoryFilter(category);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 132:** `if (country) filter.country = country;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 133:** `if (destination) filter.destination = destination;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 134:** `const currentPage = parsePage(page);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 135:** `const pageSize = parsePageSize(limit);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 136:** `const [tours, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 137:** `Tour.find(filter).select(publicListFields).slice("images", 1).slice("gallery", 1).populate({ path: "destination", select: "name slug country" }).sort({ createdAt: -1 }).skip((currentPage - 1) * pageSize).limit(pageSize).` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 138:** `Tour.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 140:** `return res.json({ success: true, count: tours.length, pagination: { page: currentPage, limit: pageSize, total, pages: Math.ceil(total / pageSize) }, data: tours.map((tour) => ({ ...attachAvailability(tour), hasOwnImage: ` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTourById` — lines 145–154

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 146:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 147:** `return await withPublicTourContext(async (platformWide) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 148:** `const filter = platformWide ? { _id: req.params.id, ...publicTourFilter } : mergeTenantFilter({ _id: req.params.id, ...publicTourFilter });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 149:** `const tour = await Tour.findOne(filter).populate({ path: "destination", select: "name slug country" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 150:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 151:** `return res.json({ success: true, data: { ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTourBySlug` — lines 156–167

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 157:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 158:** `return await withPublicTourContext(async (platformWide) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 159:** `const slug = String(req.params.slug || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 160:** `if (!slug) return res.status(400).json({ success: false, message: "Tour slug is required" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 161:** `const filter = platformWide ? { slug, ...publicTourFilter } : mergeTenantFilter({ slug, ...publicTourFilter });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 162:** `const tour = await Tour.findOne(filter).populate({ path: "destination", select: "name slug country" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 163:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 164:** `return res.json({ success: true, data: { ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getManagerTours` — lines 169–177

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: Tour.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 170:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 172:** `const filter = mergeTenantFilter({ isDeleted: false });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 173:** `if (req.user?._id) filter.createdBy = req.user._id;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 174:** `const tours = await Tour.find(filter).populate("destination assignedGuide assignedDriver assignedVehicle").sort({ createdAt: -1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 175:** `return res.json({ success: true, count: tours.length, data: tours.map((tour) => ({ ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) })) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 9: `const publicTourFilter = {`.
- Line 16: `const attachAvailability = (tourLike) => {`.
- Line 17: `const totalSlots = Number(tourLike?.availabilitySettings?.totalSlots ?? tourLike?.capacity ?? 0);`.
- Line 18: `const bookedSlots = Math.max(0, Number(tourLike?.availabilitySettings?.bookedSlots ?? 0));`.
- Line 19: `const availableSlots = Math.max(totalSlots - bookedSlots, 0);`.
- Line 25: `const withPublicTourContext = async (callback) => {`.
- Line 26: `const context = getTenantContext();`.
- Line 31: `const normalizeDestinationId = (value) => {`.
- Line 36: `export const categoryFilter = (value) => ({`.
- Line 41: `const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");`.
- Line 42: `const publicListFields = "title slug description shortDescription price discount currency duration durationDays durationDetails category country location featuredImage images galle`.
- Line 43: `const parsePage = (value) => {`.
- Line 44: `const page = Number(value);`.
- Line 47: `const parsePageSize = (value, fallback = 12) => {`.
- Line 48: `const size = Number(value);`.
- Line 52: `const ensureDestination = async (destinationId, tenantId) => {`.
- Line 53: `const id = normalizeDestinationId(destinationId);`.
- Line 55: `const filter = tenantId ? mergeTenantFilter({ _id: id }) : { _id: id };`.
- Line 59: `const hasRealTourImage = (tour) => {`.
- Line 60: `const values = [tour?.featuredImage, ...(Array.isArray(tour?.gallery) ? tour.gallery : [])];`.
- Line 62: `const url = typeof item === "string" ? item : item?.url;`.
- Line 64: `const normalized = String(url).toLowerCase();`.
- Line 69: `export const getTours = async (req, res, next) => {`.
- Line 72: `const { page = 1, limit = 12, search, destination, category, featured, duration, travellers, sort } = req.query;`.
- Line 73: `const filter = platformWide ? { ...publicTourFilter } : mergeTenantFilter({ ...publicTourFilter });`.
- Line 78: `const keyword = escapeRegex(search.trim().slice(0, 120));`.
- Line 88: `const partySize = Number(travellers);`.
- Line 92: `const currentPage = parsePage(page);`.
- Line 93: `const pageSize = parsePageSize(limit);`.
- Line 94: `const skip = (currentPage - 1) * pageSize;`.
- Line 95: `const sortBy = sort === "price-asc" ? { price: 1, createdAt: -1 }`.
- Line 99: `const [tours, total, settings] = await Promise.all([`.
- Line 104: `const data = tours.map((tour) => ({ ...attachAvailability(tour), currency: settings?.currency || "KES", currencySymbol: settings?.currencySymbol || "KSh", hasOwnImage: hasRealTourI`.
- Line 110: `export const getFeaturedTours = async (req, res, next) => {`.
- Line 113: `const filter = platformWide ? { ...publicTourFilter, featured: true } : mergeTenantFilter({ ...publicTourFilter, featured: true });`.
- Line 114: `const tours = await Tour.find(filter).select(publicListFields).slice("images", 1).slice("gallery", 1).populate({ path: "destination", select: "name slug country" }).sort({ populari`.
- Line 120: `export const searchTours = async (req, res, next) => {`.
- Line 123: `const { keyword, search, category, country, destination, page = 1, limit = 12 } = req.query;`.
- Line 124: `const filter = platformWide ? { ...publicTourFilter } : mergeTenantFilter({ ...publicTourFilter });`.
- Line 125: `const term = keyword || search;`.
- Line 134: `const currentPage = parsePage(page);`.
- Line 135: `const pageSize = parsePageSize(limit);`.
- Line 136: `const [tours, total] = await Promise.all([`.
- Line 145: `export const getTourById = async (req, res, next) => {`.
- Line 148: `const filter = platformWide ? { _id: req.params.id, ...publicTourFilter } : mergeTenantFilter({ _id: req.params.id, ...publicTourFilter });`.
- Line 149: `const tour = await Tour.findOne(filter).populate({ path: "destination", select: "name slug country" }).lean();`.
- Line 156: `export const getTourBySlug = async (req, res, next) => {`.
- Line 159: `const slug = String(req.params.slug || "").trim().toLowerCase();`.
- Line 161: `const filter = platformWide ? { slug, ...publicTourFilter } : mergeTenantFilter({ slug, ...publicTourFilter });`.
- Line 162: `const tour = await Tour.findOne(filter).populate({ path: "destination", select: "name slug country" }).lean();`.
- Line 169: `export const getManagerTours = async (req, res, next) => {`.
- Line 172: `const filter = mergeTenantFilter({ isDeleted: false });`.
- Line 174: `const tours = await Tour.find(filter).populate("destination assignedGuide assignedDriver assignedVehicle").sort({ createdAt: -1 }).lean();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
