import { getUserRole } from "../utils/roleUtils.js";

const customerRoles = new Set(["customer"]);

export const paymentMutationGuard = (req, res, next) => {
  const role = getUserRole(req.user);
  if (customerRoles.has(role) && Object.prototype.hasOwnProperty.call(req.body || {}, "paymentStatus")) {
    return res.status(403).json({ success: false, message: "Payment status can only be changed by the verified payment lifecycle." });
  }
  return next();
};

export default paymentMutationGuard;
