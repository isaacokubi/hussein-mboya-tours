import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import PurchaseOrder from "../models/PurchaseOrder.js";
import TourCost from "../models/TourCost.js";
import SupplierPayable from "../models/SupplierPayable.js";
import Supplier from "../models/Supplier.js";
import CorporateAccount from "../models/CorporateAccount.js";

test("purchase order calculates line, tax and total amounts", async () => {
  const po = new PurchaseOrder({ tenantId: new mongoose.Types.ObjectId(), supplier: new mongoose.Types.ObjectId(), lines: [{ description: "Hotel rooms", quantity: 2, unitCost: 10000, taxRate: 16, taxType: "standard" }] });
  await po.validate();
  assert.equal(po.lines[0].subtotal, 20000);
  assert.equal(po.lines[0].taxAmount, 3200);
  assert.equal(po.totalAmount, 23200);
});

test("tour cost calculates total cost", async () => {
  const cost = new TourCost({ tenantId: new mongoose.Types.ObjectId(), tour: new mongoose.Types.ObjectId(), category: "transport", description: "Vehicle hire", quantity: 3, unitCost: 8500, taxAmount: 0 });
  await cost.validate();
  assert.equal(cost.totalCost, 25500);
});

test("supplier payable prevents overpayment and derives balance/status", async () => {
  const payable = new SupplierPayable({ tenantId: new mongoose.Types.ObjectId(), supplier: new mongoose.Types.ObjectId(), amount: 50000, amountPaid: 12500 });
  await payable.validate();
  assert.equal(payable.balance, 37500);
  assert.equal(payable.status, "partially_paid");
  const invalid = new SupplierPayable({ tenantId: new mongoose.Types.ObjectId(), supplier: new mongoose.Types.ObjectId(), amount: 100, amountPaid: 101 });
  await assert.rejects(() => invalid.validate(), /cannot exceed/);
});

test("supplier and corporate account schemas require tenant and core identity", async () => {
  const supplier = new Supplier({ tenantId: new mongoose.Types.ObjectId(), legalName: "Kenya Safari Supplies" });
  await supplier.validate();
  assert.match(supplier.supplierNumber, /^SUP-/);
  const corporate = new CorporateAccount({ tenantId: new mongoose.Types.ObjectId(), companyName: "Example Holdings" });
  await corporate.validate();
  assert.match(corporate.accountNumber, /^CORP-/);
});
