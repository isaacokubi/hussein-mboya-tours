/**
 * Purpose: quotation Calculator business-logic service. Main declarations: calculateQuotation.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
/*
|--------------------------------------------------------------------------
| CALCULATE QUOTATION TOTALS
|--------------------------------------------------------------------------
*/

// Declare calculateQuotation for use by the surrounding module or function.
export const calculateQuotation = (
  items = [],
  discount = 0,
  taxRate = 0
) => {
  // Check the condition (!Array.isArray(items)) and run the matching branch.
  if (!Array.isArray(items)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Items must be an array.");
  }

  // Declare subtotal for use by the surrounding module or function.
  let subtotal = 0;
  // Declare totalItems for use by the surrounding module or function.
  let totalItems = 0;

  // Repeat the enclosed work for each required iteration.
  for (const item of items) {
    // Declare quantity for use by the surrounding module or function.
    const quantity = Number(item.quantity);
    // Declare unitPrice for use by the surrounding module or function.
    const unitPrice = Number(item.unitPrice);

    // Check the condition (!Number.isFinite(quantity) || quantity < 0) and run the matching branch.
    if (
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(
        `Invalid quantity for "${item.name || "item"}".`
      );
    }

    // Check the condition (!Number.isFinite(unitPrice) || unitPrice < 0) and run the matching branch.
    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(
        `Invalid unit price for "${item.name || "item"}".`
      );
    }

    // Perform the side effect or state update expressed on the following line.
    subtotal += quantity * unitPrice;
    // Perform the side effect or state update expressed on the following line.
    totalItems += quantity;
  }

  // Perform the side effect or state update expressed on the following line.
  discount = Math.max(0, Number(discount) || 0);

  // Declare taxableAmount for use by the surrounding module or function.
  const taxableAmount = Math.max(
    subtotal - discount,
    0
  );

  // Declare tax for use by the surrounding module or function.
  const tax =
    taxableAmount * (Number(taxRate) || 0) / 100;

  // Declare grandTotal for use by the surrounding module or function.
  const grandTotal = taxableAmount + tax;

  // Return the object assembled below to the caller.
  return {
    totalItems,

    subtotal: Number(subtotal.toFixed(2)),

    discount: Number(discount.toFixed(2)),

    tax: Number(tax.toFixed(2)),

    grandTotal: Number(grandTotal.toFixed(2)),
  };
};
