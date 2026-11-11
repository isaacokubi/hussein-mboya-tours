/**
 * Purpose: operations Module.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/PurchaseOrder.js so this module can use its exported dependencies.
import PurchaseOrder from "../models/PurchaseOrder.js";
// Load ../models/TourCost.js so this module can use its exported dependencies.
import TourCost from "../models/TourCost.js";
// Load ../models/SupplierPayable.js so this module can use its exported dependencies.
import SupplierPayable from "../models/SupplierPayable.js";
// Load ../models/Supplier.js so this module can use its exported dependencies.
import Supplier from "../models/Supplier.js";
// Load ../models/CorporateAccount.js so this module can use its exported dependencies.
import CorporateAccount from "../models/CorporateAccount.js";

// Perform the side effect or state update expressed on the following line.
test("purchase order calculates line, tax and total amounts", async () => {
  // Declare po for use by the surrounding module or function.
  const po = new PurchaseOrder({ tenantId: new mongoose.Types.ObjectId(), supplier: new mongoose.Types.ObjectId(), lines: [{ description: "Hotel rooms", quantity: 2, unitCost: 10000, taxRate: 16, taxType: "standard" }] });
  // Perform the side effect or state update expressed on the following line.
  await po.validate();
  // Perform the side effect or state update expressed on the following line.
  assert.equal(po.lines[0].subtotal, 20000);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(po.lines[0].taxAmount, 3200);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(po.totalAmount, 23200);
});

// Perform the side effect or state update expressed on the following line.
test("tour cost calculates total cost", async () => {
  // Declare cost for use by the surrounding module or function.
  const cost = new TourCost({ tenantId: new mongoose.Types.ObjectId(), tour: new mongoose.Types.ObjectId(), category: "transport", description: "Vehicle hire", quantity: 3, unitCost: 8500, taxAmount: 0 });
  // Perform the side effect or state update expressed on the following line.
  await cost.validate();
  // Perform the side effect or state update expressed on the following line.
  assert.equal(cost.totalCost, 25500);
});

// Perform the side effect or state update expressed on the following line.
test("supplier payable prevents overpayment and derives balance/status", async () => {
  // Declare payable for use by the surrounding module or function.
  const payable = new SupplierPayable({ tenantId: new mongoose.Types.ObjectId(), supplier: new mongoose.Types.ObjectId(), amount: 50000, amountPaid: 12500 });
  // Perform the side effect or state update expressed on the following line.
  await payable.validate();
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payable.balance, 37500);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payable.status, "partially_paid");
  // Declare invalid for use by the surrounding module or function.
  const invalid = new SupplierPayable({ tenantId: new mongoose.Types.ObjectId(), supplier: new mongoose.Types.ObjectId(), amount: 100, amountPaid: 101 });
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(() => invalid.validate(), /cannot exceed/);
});

// Perform the side effect or state update expressed on the following line.
test("supplier and corporate account schemas require tenant and core identity", async () => {
  // Declare supplier for use by the surrounding module or function.
  const supplier = new Supplier({ tenantId: new mongoose.Types.ObjectId(), legalName: "Kenya Safari Supplies" });
  // Perform the side effect or state update expressed on the following line.
  await supplier.validate();
  // Perform the side effect or state update expressed on the following line.
  assert.match(supplier.supplierNumber, /^SUP-/);
  // Declare corporate for use by the surrounding module or function.
  const corporate = new CorporateAccount({ tenantId: new mongoose.Types.ObjectId(), companyName: "Example Holdings" });
  // Perform the side effect or state update expressed on the following line.
  await corporate.validate();
  // Perform the side effect or state update expressed on the following line.
  assert.match(corporate.accountNumber, /^CORP-/);
});
