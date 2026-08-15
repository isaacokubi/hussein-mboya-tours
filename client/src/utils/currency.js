export const formatCurrency = (
  amount = 0,
  currency = "KES",
  symbol = null
) => {

  const value = Number(amount || 0);

  const symbols = {
    KES: "KSh",
    USD: "$",
    EUR: "€",
    GBP: "£"
  };

  const currencySymbol =
    symbol ||
    symbols[currency] ||
    currency;

  return `${currencySymbol} ${value.toLocaleString()}`;
};


export const getCurrency = (settings = {}) => {
  return settings?.currency || "KES";
};


export const getCurrencySymbol = (settings = {}) => {
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
