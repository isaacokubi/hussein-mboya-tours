/**
 * Purpose: payment Mutation Guard request middleware. Main declarations: paymentMutationGuard.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export const paymentMutationGuard = (req, res, next) => {
  // Check the condition (Object.prototype.hasOwnProperty.call(req.body || {}, "paymentStatus")) and run the matching branch.
  if (Object.prototype.hasOwnProperty.call(req.body || {}, "paymentStatus")) {
    // Return the result of res.status(403).json() to the caller.
    return res.status(403).json({
      success: false,
      message: "Payment status is read-only on booking records and can only be changed by the verified payment lifecycle.",
    });
  }
  // Return the result of next() to the caller.
  return next();
};

export default paymentMutationGuard;
