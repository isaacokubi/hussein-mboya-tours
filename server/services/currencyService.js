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

export const convertCurrency = (amount, rate) => {
  const sourceAmount = Number(amount);
  const exchangeRate = Number(rate);

  if (!Number.isFinite(sourceAmount)) {
    throw new Error("Invalid amount.");
  }

  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    throw new Error("Invalid exchange rate.");
  }

  return Number((sourceAmount / exchangeRate).toFixed(2));
};
