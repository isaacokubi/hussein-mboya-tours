import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("hospitality invoices use the shared invoice model with eTIMS fields", () => {
  const invoice = read("models/Invoice.js");
  assert.match(invoice, /hospitalityBooking/);
  assert.match(invoice, /hospitalityType/);
  assert.match(invoice, /etimsStatus/);
  assert.match(invoice, /partialFilterExpression/);
});

test("hospitality finance posts invoices and payments to the general ledger", () => {
  const accounting = read("services/operationalAccountingService.js");
  const payment = read("models/Payment.js");
  assert.match(accounting, /4010/);
  assert.match(accounting, /4020/);
  assert.match(accounting, /postPaymentToLedger/);
  assert.match(payment, /syncHospitalityInvoicePayments/);
});

test("hospitality payment completion exposes Card and Bank workflows", () => {
  const controller = read("controllers/hospitalityPaymentController.js");
  const routes = read("routes/hospitalityPaymentRoutes.js");
  assert.match(controller, /initiateHospitalityCard/);
  assert.match(controller, /verifyHospitalityCard/);
  assert.match(controller, /submitHospitalityBank/);
  assert.match(controller, /confirmHospitalityBank/);
  assert.match(routes, /\/card/);
  assert.match(routes, /\/bank/);
});
