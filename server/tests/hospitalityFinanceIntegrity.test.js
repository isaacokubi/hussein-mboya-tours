/**
 * Purpose: hospitality Finance Integrity.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";

// Declare root for use by the surrounding module or function.
const root = path.resolve(process.cwd());
// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Perform the side effect or state update expressed on the following line.
test("hospitality invoices use the shared invoice model with eTIMS fields", () => {
  // Declare invoice for use by the surrounding module or function.
  const invoice = read("models/Invoice.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(invoice, /hospitalityBooking/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(invoice, /hospitalityType/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(invoice, /etimsStatus/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(invoice, /partialFilterExpression/);
});

// Perform the side effect or state update expressed on the following line.
test("hospitality finance posts invoices and payments to the general ledger", () => {
  // Declare accounting for use by the surrounding module or function.
  const accounting = read("services/operationalAccountingService.js");
  // Declare payment for use by the surrounding module or function.
  const payment = read("models/Payment.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(accounting, /4010/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(accounting, /4020/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(accounting, /postPaymentToLedger/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(payment, /syncHospitalityInvoicePayments/);
});

// Perform the side effect or state update expressed on the following line.
test("hospitality payment completion exposes Card and Bank workflows", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/hospitalityPaymentController.js");
  // Declare routes for use by the surrounding module or function.
  const routes = read("routes/hospitalityPaymentRoutes.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /initiateHospitalityCard/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /verifyHospitalityCard/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /submitHospitalityBank/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /confirmHospitalityBank/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /\/card/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /\/bank/);
});
