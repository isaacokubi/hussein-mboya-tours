const invalidAmount = (message) => Object.assign(new Error(message), {
  status: 400,
  code: "INVALID_MPESA_AMOUNT",
  expose: true,
});

export const resolveMpesaPaymentAmount = (requestedAmount, payableBalance) => {
  const balance = Number(payableBalance);
  if (!Number.isSafeInteger(balance) || balance < 1) {
    throw invalidAmount("This booking does not have a valid whole-KES balance.");
  }

  const isAmountOmitted = requestedAmount === undefined
    || requestedAmount === null
    || (typeof requestedAmount === "string" && requestedAmount.trim() === "");
  const amount = isAmountOmitted ? balance : Number(requestedAmount);
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > balance) {
    throw invalidAmount(`Payment amount must be a whole KES amount between 1 and ${balance.toLocaleString()}.`);
  }
  return amount;
};
