import { mergeTenantFilter } from "../tenancy/context.js";
/*
|--------------------------------------------------------------------------
| CALCULATE QUOTATION TOTALS
|--------------------------------------------------------------------------
*/

export const calculateQuotation = (
  items = [],
  discount = 0,
  taxRate = 0
) => {
  if (!Array.isArray(items)) {
    throw new Error("Items must be an array.");
  }

  let subtotal = 0;
  let totalItems = 0;

  for (const item of items) {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    if (
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      throw new Error(
        `Invalid quantity for "${item.name || "item"}".`
      );
    }

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      throw new Error(
        `Invalid unit price for "${item.name || "item"}".`
      );
    }

    subtotal += quantity * unitPrice;
    totalItems += quantity;
  }

  discount = Math.max(0, Number(discount) || 0);

  const taxableAmount = Math.max(
    subtotal - discount,
    0
  );

  const tax =
    taxableAmount * (Number(taxRate) || 0) / 100;

  const grandTotal = taxableAmount + tax;

  return {
    totalItems,

    subtotal: Number(subtotal.toFixed(2)),

    discount: Number(discount.toFixed(2)),

    tax: Number(tax.toFixed(2)),

    grandTotal: Number(grandTotal.toFixed(2)),
  };
};
