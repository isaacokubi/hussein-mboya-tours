export const formatCurrency = (amount, currency = "KES") => {
  return `${currency} ${Number(amount || 0).toLocaleString()}`;
};

export const getCurrency = (settings) => {
  return settings?.currency || "KES";
};
