# Source explanation: server/controllers/guideController.js

**Source:** [server/controllers/guideController.js](../../../server/controllers/guideController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `TourReport` from `../models/TourReport.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourReport.js](../../../server/models/TourReport.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)

## Runtime declarations and data flow

### `scope` — lines 9–9

Parameters: `req`, `filter (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalize` — lines 11–11

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `resolveGuide` — lines 13–74

Parameters: `req`.
Reads request/component inputs: req.user, req.tenantId. Persistent operations detected: Staff.findOne, Staff.find, Staff.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `const user = req.user;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (!user?._id) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `const baseFilter = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `let guide = await Staff.findOne(scope(req, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `if (!guide) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `const candidates = await Staff.find(scope(req, baseFilter))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `const email = normalize(user.email);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const phone = normalize(user.phone);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const name = normalize(user.name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const matches = candidates.filter((candidate) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const candidateEmail = normalize(candidate.email);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const candidatePhone = normalize(candidate.phone);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const candidateName = normalize(candidate.name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `return (email && candidateEmail === email) || (phone && candidatePhone === phone) || (name && candidateName === name);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 44:** `if (matches.length === 1) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `guide = await Staff.findOne(scope(req, { _id: matches[0]._id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 49:** `if (guide) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `let changed = false;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getGuideOr404` — lines 76–83

Parameters: `req`, `res`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 77:** `const guide = await resolveGuide(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 78:** `if (!guide) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 79:** `res.status(404).json({ success: false, message: "Guide profile not found" });` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 80:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 82:** `return guide;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `startOfDay` — lines 85–88

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 86:** `const d = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `return new Date(d.getFullYear(), d.getMonth(), d.getDate());` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTourStart` — lines 89–89

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getTourEnd` — lines 90–97

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 91:** `if (tour.endDate) return new Date(tour.endDate);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 92:** `const start = getTourStart(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const end = new Date(start);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 96:** `return end;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `guideTourFilter` — lines 99–102

Parameters: `req`, `guide`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `syncTourLifecycle` — lines 104–116

Parameters: `req`, `tours`.
Persistent operations detected: Tour.updateOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 105:** `const today = startOfDay(new Date());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `for (const tour of tours) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 107:** `const start = startOfDay(getTourStart(tour));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `const end = startOfDay(getTourEnd(tour));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `if (tour.status !== "cancelled" && tour.status !== "completed" && today > end) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 113:** `await Tour.updateOne(scope(req, { _id: tour._id }), { $set: { status: "completed", assignmentStatus: "completed", completedAt: tour.completedAt, endDate: getTourEnd(tour) } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `guideDashboard` — lines 118–141

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId. Persistent operations detected: Tour.find, Booking.aggregate; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 120:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 121:** `const guide = await getGuideOr404(req, res);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 122:** `if (!guide) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 123:** `const assignmentFilter = guideTourFilter(req, guide);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 124:** `let tours = await Tour.find(assignmentFilter).populate("destination").populate("assignedVehicle").populate("assignedDriver").sort({ startDate: 1, date: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 125:** `await syncTourLifecycle(req, tours);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 126:** `tours = await Tour.find(assignmentFilter).populate("destination").populate("assignedVehicle").populate("assignedDriver").sort({ startDate: 1, date: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 127:** `const tourIds = tours.map((tour) => tour._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `const guestStats = tourIds.length ? await Booking.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 132:** `const guestMap = new Map(guestStats.map((item) => [item._id.toString(), { guests: item.guests || 0, bookings: item.bookings || 0 }]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 133:** `const formattedTours = tours.map((tour) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 134:** `const stats = guestMap.get(tour._id.toString()) || { guests: 0, bookings: 0 };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 135:** `const startDate = getTourStart(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 136:** `const endDate = getTourEnd(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 137:** `return { ...tour, date: tour.date || startDate, startDate, endDate, guests: stats.guests, bookings: stats.bookings };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 139:** `return res.status(200).json({ success: true, count: formattedTours.length, stats: { totalTours: formattedTours.length, ongoingTours: formattedTours.filter((tour) => tour.status === "ongoing").length, completedTours: form` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAssignedTours` — lines 143–152

Parameters: `req`, `res`, `next`.
Persistent operations detected: Tour.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 145:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 146:** `const guide = await getGuideOr404(req, res);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 147:** `if (!guide) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 148:** `const tours = await Tour.find(guideTourFilter(req, guide)).populate("destination").populate("assignedVehicle").populate("assignedDriver").sort({ startDate: 1, date: 1 }).limit(50);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 149:** `await syncTourLifecycle(req, tours);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 150:** `return res.status(200).json({ success: true, count: tours.length, tours, data: tours });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTourDetails` — lines 154–164

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 156:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 157:** `const guide = await getGuideOr404(req, res);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 158:** `if (!guide) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 159:** `const tour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 161:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 162:** `return res.status(200).json({ success: true, tour, data: { tour } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTourGuests` — lines 166–178

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Tour.findOne, Booking.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 168:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 169:** `const guide = await getGuideOr404(req, res);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 170:** `if (!guide) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 171:** `const assignedTour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 172:** `if (!assignedTour) return res.status(403).json({ success: false, message: "You are not assigned to this tour" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 173:** `const bookings = await Booking.find(scope(req, { tour: assignedTour._id, isDeleted: { $ne: true }, status: { $in: ["confirmed", "assigned", "ongoing", "completed"] } }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 176:** `return res.status(200).json({ success: true, count: bookings.length, guests: bookings, data: bookings });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateTourStatus` — lines 180–201

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 182:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 183:** `const { status } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 184:** `if (!TOUR_STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid tour status" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 185:** `const guide = await getGuideOr404(req, res);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 186:** `if (!guide) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 187:** `const assignedTourForDate = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] })).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 188:** `if (!assignedTourForDate) return res.status(404).json({ success: false, message: "Tour not found or not assigned to you" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 189:** `const today = startOfDay(new Date());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 190:** `const start = startOfDay(getTourStart(assignedTourForDate));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 191:** `const end = startOfDay(getTourEnd(assignedTourForDate));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 192:** `if (status === "ongoing" && today.getTime() !== start.getTime()) return res.status(400).json({ success: false, message: \`This tour can only be started on ${start.toLocaleDateString()}.\` });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 193:** `if (status === "completed" && today < end) return res.status(400).json({ success: false, message: "This tour cannot be completed before its final day." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 194:** `const update = { status, endDate: assignedTourForDate.endDate || end };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 195:** `if (status === "ongoing") update.startedAt = new Date();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 196:** `if (status === "completed") { update.completedAt = new Date(); update.assignmentStatus = "completed"; }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 197:** `const tour = await Tour.findOneAndUpdate(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }), { $set: update }, { new: true, runValidators: true }).populate("assignedGuide").populate("assignedDriv` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 198:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found or not assigned to you" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 199:** `return res.status(200).json({ success: true, message: "Tour status updated successfully", tour, data: { tour } });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `submitTourReport` — lines 203–217

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.tenantId, req.body. Persistent operations detected: Tour.findOne, TourReport.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 205:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 206:** `const guide = await getGuideOr404(req, res);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 207:** `if (!guide) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 208:** `const assignedTour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 209:** `if (!assignedTour) return res.status(403).json({ success: false, message: "You are not assigned to this tour" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 210:** `const report = await TourReport.create({ tenantId: req.tenantId, tour: assignedTour._id, guide: guide._id, summary: req.body.summary, issues: req.body.issues || [], photos: req.body.photos || [] });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 214:** `await assignedTour.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 215:** `return res.status(201).json({ success: true, message: "Tour report submitted successfully", report });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const TOUR_STATUSES = ["scheduled", "upcoming", "ongoing", "completed", "cancelled"];`.
- Line 8: `const GUIDE_POSITIONS = ["guide", "tour_guide", "tourguide"];`.
- Line 9: `const scope = (req, filter = {}) => mergeTenantFilter(req, filter);`.
- Line 11: `const normalize = (value) => String(value || "").trim().toLowerCase();`.
- Line 13: `const resolveGuide = async (req) => {`.
- Line 14: `const user = req.user;`.
- Line 18: `const baseFilter = {`.
- Line 23: `let guide = await Staff.findOne(scope(req, {`.
- Line 32: `const candidates = await Staff.find(scope(req, baseFilter))`.
- Line 35: `const email = normalize(user.email);`.
- Line 36: `const phone = normalize(user.phone);`.
- Line 37: `const name = normalize(user.name);`.
- Line 38: `const matches = candidates.filter((candidate) => {`.
- Line 39: `const candidateEmail = normalize(candidate.email);`.
- Line 40: `const candidatePhone = normalize(candidate.phone);`.
- Line 41: `const candidateName = normalize(candidate.name);`.
- Line 50: `let changed = false;`.
- Line 76: `const getGuideOr404 = async (req, res) => {`.
- Line 77: `const guide = await resolveGuide(req);`.
- Line 85: `const startOfDay = (value) => {`.
- Line 86: `const d = new Date(value);`.
- Line 89: `const getTourStart = (tour) => new Date(tour.startDate || tour.date);`.
- Line 90: `const getTourEnd = (tour) => {`.
- Line 92: `const start = getTourStart(tour);`.
- Line 93: `const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));`.
- Line 94: `const end = new Date(start);`.
- Line 99: `const guideTourFilter = (req, guide) => scope(req, {`.
- Line 104: `const syncTourLifecycle = async (req, tours) => {`.
- Line 105: `const today = startOfDay(new Date());`.
- Line 107: `const start = startOfDay(getTourStart(tour));`.
- Line 108: `const end = startOfDay(getTourEnd(tour));`.
- Line 118: `export const guideDashboard = async (req, res, next) => {`.
- Line 121: `const guide = await getGuideOr404(req, res);`.
- Line 123: `const assignmentFilter = guideTourFilter(req, guide);`.
- Line 124: `let tours = await Tour.find(assignmentFilter).populate("destination").populate("assignedVehicle").populate("assignedDriver").sort({ startDate: 1, date: 1 }).lean();`.
- Line 127: `const tourIds = tours.map((tour) => tour._id);`.
- Line 128: `const guestStats = tourIds.length ? await Booking.aggregate([`.
- Line 132: `const guestMap = new Map(guestStats.map((item) => [item._id.toString(), { guests: item.guests || 0, bookings: item.bookings || 0 }]));`.
- Line 133: `const formattedTours = tours.map((tour) => {`.
- Line 134: `const stats = guestMap.get(tour._id.toString()) || { guests: 0, bookings: 0 };`.
- Line 135: `const startDate = getTourStart(tour);`.
- Line 136: `const endDate = getTourEnd(tour);`.
- Line 143: `export const getAssignedTours = async (req, res, next) => {`.
- Line 146: `const guide = await getGuideOr404(req, res);`.
- Line 148: `const tours = await Tour.find(guideTourFilter(req, guide)).populate("destination").populate("assignedVehicle").populate("assignedDriver").sort({ startDate: 1, date: 1 }).limit(50);`.
- Line 154: `export const getTourDetails = async (req, res, next) => {`.
- Line 157: `const guide = await getGuideOr404(req, res);`.
- Line 159: `const tour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }))`.
- Line 166: `export const getTourGuests = async (req, res, next) => {`.
- Line 169: `const guide = await getGuideOr404(req, res);`.
- Line 171: `const assignedTour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }));`.
- Line 173: `const bookings = await Booking.find(scope(req, { tour: assignedTour._id, isDeleted: { $ne: true }, status: { $in: ["confirmed", "assigned", "ongoing", "completed"] } }))`.
- Line 180: `export const updateTourStatus = async (req, res, next) => {`.
- Line 183: `const { status } = req.body;`.
- Line 185: `const guide = await getGuideOr404(req, res);`.
- Line 187: `const assignedTourForDate = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] })).lean();`.
- Line 189: `const today = startOfDay(new Date());`.
- Line 190: `const start = startOfDay(getTourStart(assignedTourForDate));`.
- Line 191: `const end = startOfDay(getTourEnd(assignedTourForDate));`.
- Line 194: `const update = { status, endDate: assignedTourForDate.endDate || end };`.
- Line 197: `const tour = await Tour.findOneAndUpdate(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }), { $set: update }, { new: true, runValidators: true }).populate`.
- Line 203: `export const submitTourReport = async (req, res, next) => {`.
- Line 206: `const guide = await getGuideOr404(req, res);`.
- Line 208: `const assignedTour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }));`.
- Line 210: `const report = await TourReport.create({ tenantId: req.tenantId, tour: assignedTour._id, guide: guide._id, summary: req.body.summary, issues: req.body.issues || [], photos: req.bod`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
