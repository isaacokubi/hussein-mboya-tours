/**
 * Purpose: currency client application module. Main declarations: formatCurrency, getCurrency, getCurrencySymbol.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export const formatCurrency = (
  amount = 0,
  currency = "KES",
  symbol = null
) => {

  // Declare value for use by the surrounding module or function.
  const value = Number(amount || 0);

  // Declare symbols for use by the surrounding module or function.
  const symbols = {
    KES: "KSh",
    USD: "$",
    EUR: "€",
    GBP: "£"
  };

  // Declare currencySymbol for use by the surrounding module or function.
  const currencySymbol =
    symbol ||
    symbols[currency] ||
    currency;

  // Return the expression shown below to the caller.
  return `${currencySymbol} ${value.toLocaleString()}`;
};


// Declare getCurrency for use by the surrounding module or function.
export const getCurrency = (settings = {}) => {
  // Return the expression shown below to the caller.
  return settings?.currency || "KES";
};


// Declare getCurrencySymbol for use by the surrounding module or function.
export const getCurrencySymbol = (settings = {}) => {
  // Return the expression shown below to the caller.
  return (
    settings?.currencySymbol ||
    {
      KES:"KSh",
      USD:"$",
      EUR:"€",
      GBP:"£"
    }[settings?.currency] ||
    "KSh"
  );
};
