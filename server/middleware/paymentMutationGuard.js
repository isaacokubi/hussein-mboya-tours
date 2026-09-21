export const paymentMutationGuard = (req, res, next) => {
  if (Object.prototype.hasOwnProperty.call(req.body || {}, "paymentStatus")) {
    return res.status(403).json({
      success: false,
      message: "Payment status is read-only on booking records and can only be changed by the verified payment lifecycle.",
    });
  }
  return next();
};

export default paymentMutationGuard;
