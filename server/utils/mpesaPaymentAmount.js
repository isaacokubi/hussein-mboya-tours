/**
 * Purpose: mpesa Payment Amount server application module. Main declarations: invalidAmount, resolveMpesaPaymentAmount.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
const invalidAmount = (message) => Object.assign(new Error(message), {
  status: 400,
  code: "INVALID_MPESA_AMOUNT",
  expose: true,
});

// Declare resolveMpesaPaymentAmount for use by the surrounding module or function.
export const resolveMpesaPaymentAmount = (requestedAmount, payableBalance) => {
  // Declare balance for use by the surrounding module or function.
  const balance = Number(payableBalance);
  // Check the condition (!Number.isSafeInteger(balance) || balance < 1) and run the matching branch.
  if (!Number.isSafeInteger(balance) || balance < 1) {
    // Stop the current operation by raising the result of invalidAmount().
    throw invalidAmount("This booking does not have a valid whole-KES balance.");
  }

  // Declare isAmountOmitted for use by the surrounding module or function.
  const isAmountOmitted = requestedAmount === undefined
    || requestedAmount === null
    || (typeof requestedAmount === "string" && requestedAmount.trim() === "");
  // Declare amount for use by the surrounding module or function.
  const amount = isAmountOmitted ? balance : Number(requestedAmount);
  // Check the condition (!Number.isSafeInteger(amount) || amount < 1 || amount > balance) and run the matching branch.
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > balance) {
    // Stop the current operation by raising the result of invalidAmount().
    throw invalidAmount(`Payment amount must be a whole KES amount between 1 and ${balance.toLocaleString()}.`);
  }
  // Return the value of amount to the caller.
  return amount;
};
