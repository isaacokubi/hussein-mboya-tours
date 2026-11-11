/**
 * Purpose: currency Service business-logic service. Main declarations: convertCurrency.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
/*
|--------------------------------------------------------------------------
| CONVERT CURRENCY
|--------------------------------------------------------------------------
|
| amount: Amount in source currency
| rate: Exchange rate (source per target)
|
| Returns:
| Number
|
*/

// Declare convertCurrency for use by the surrounding module or function.
export const convertCurrency = (amount, rate) => {
  // Declare sourceAmount for use by the surrounding module or function.
  const sourceAmount = Number(amount);
  // Declare exchangeRate for use by the surrounding module or function.
  const exchangeRate = Number(rate);

  // Check the condition (!Number.isFinite(sourceAmount)) and run the matching branch.
  if (!Number.isFinite(sourceAmount)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Invalid amount.");
  }

  // Check the condition (!Number.isFinite(exchangeRate) || exchangeRate <= 0) and run the matching branch.
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Invalid exchange rate.");
  }

  // Return the result of Number() to the caller.
  return Number((sourceAmount / exchangeRate).toFixed(2));
};
