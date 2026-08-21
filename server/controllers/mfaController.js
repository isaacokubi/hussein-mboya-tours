import { mergeTenantFilter } from "../tenancy/context.js";
import User from "../models/User.js";
import { createAuditLog } from "../services/auditService.js";
import { generateLoginPin, hashLoginPin, verifyLoginPin, normalizeMfaPhone } from "../services/mfaService.js";
import { sendSMS } from "../services/smsService.js";
import generateToken from "../utils/generateToken.js";
import buildPermissions from "../utils/buildPermissions.js";

const MAX_MFA_ATTEMPTS = 5;
const MFA_EXPIRY_MS = 5 * 60 * 1000;
const MFA_RESEND_DELAY_MS = 30 * 1000;

export const createCustomerLoginChallenge = async (user) => {
  if (!user?._id) throw new Error("Invalid MFA user.");

  const phone = normalizeMfaPhone(user.phone);
  if (!phone) throw new Error("This account does not have a valid registered phone number.");

  const now = Date.now();
  if (user.loginPinLastSentAt && now - new Date(user.loginPinLastSentAt).getTime() < MFA_RESEND_DELAY_MS) {
    throw new Error("Please wait before requesting another verification PIN.");
  }

  const pin = generateLoginPin();
  user.loginPinHash = await hashLoginPin(pin);
  user.loginPinExpiresAt = new Date(now + MFA_EXPIRY_MS);
  user.loginPinAttempts = 0;
  user.loginPinLastSentAt = new Date();
  await user.save({ validateBeforeSave: false });

  try {
    await sendSMS(phone, `Your Hussein Mboya Tours login PIN is ${pin}. It expires in 5 minutes. Do not share this PIN with anyone.`);
  } catch (error) {
    user.loginPinHash = "";
    user.loginPinExpiresAt = null;
    user.loginPinAttempts = 0;
    await user.save({ validateBeforeSave: false });
    throw error;
  }

  return {
    userId: user._id,
    phone,
    pin
  };
};

export const sendCustomerLoginPin = async (req, res, next) => {
  try {
    const userId = String(req.body?.userId || "").trim();
    if (!userId) return res.status(400).json({ success: false, message: "MFA user ID is required." });

    const user = await User.findById(userId).select("+loginPinHash +loginPinExpiresAt +loginPinAttempts +loginPinLastSentAt");
    if (!user) return res.status(404).json({ success: false, message: "User account not found." });
    if ((user.roleId?.name || user.role || user.legacyRole) !== "customer") return res.status(400).json({ success: false, message: "Customer MFA is not available for this account." });

    const challenge = await createCustomerLoginChallenge(user);
    return res.status(200).json({
      success: true,
      mfaRequired: true,
      userId: user._id,

      devPin:
        String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true"
          ? challenge.pin
          : undefined,

      message:
        String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true"
          ? `Development PIN: ${challenge.pin}`
          : "A 4-digit verification PIN has been sent to your registered phone."
    });
  } catch (error) {
    if (error.message.includes("wait before requesting")) return res.status(429).json({ success: false, message: error.message });
    next(error);
  }
};

export const verifyCustomerLoginPin = async (req, res, next) => {
  try {
    const userId = String(req.body?.userId || "").trim();
    const pin = String(req.body?.pin || "").trim();
    if (!userId || !/^\d{4}$/.test(pin)) return res.status(400).json({ success: false, message: "User ID and 4-digit PIN are required." });

    const user = await User.findById(userId)
      .select("+loginPinHash +loginPinExpiresAt +loginPinAttempts +loginPinLastSentAt")
      .populate({ path: "roleId", populate: { path: "permissions" } })
      .populate("permissionsOverride");

    if (!user || (user.roleId?.name || user.role || user.legacyRole) !== "customer") return res.status(401).json({ success: false, message: "Invalid MFA request." });
    if (!user.loginPinHash || !user.loginPinExpiresAt) return res.status(400).json({ success: false, message: "No active login PIN exists. Request a new PIN." });

    if (new Date(user.loginPinExpiresAt).getTime() < Date.now()) {
      user.loginPinHash = "";
      user.loginPinExpiresAt = null;
      user.loginPinAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, message: "The login PIN has expired. Request a new PIN." });
    }

    const attempts = Number(user.loginPinAttempts || 0);
    if (attempts >= MAX_MFA_ATTEMPTS) return res.status(429).json({ success: false, message: "Too many incorrect PIN attempts. Request a new PIN." });

    const valid = await verifyLoginPin(pin, user.loginPinHash);
    if (!valid) {
      user.loginPinAttempts = attempts + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, message: "Incorrect verification PIN.", attemptsRemaining: Math.max(0, MAX_MFA_ATTEMPTS - user.loginPinAttempts) });
    }

    const permissions = buildPermissions(user);
    const effectiveRole = user.roleId?.name || user.role || user.legacyRole || "customer";

    user.loginPinHash = "";
    user.loginPinExpiresAt = null;
    user.loginPinAttempts = 0;
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

      const token = generateToken({
        _id: user._id,
        role: effectiveRole,
        roleId: user.roleId,
        email: user.email,
        permissions,
        tenantId:
          user?.tenantId ||
          organization?._id ||
          req.headers["x-tenant-id"] ||
          null
      });

    await createAuditLog({ user: user._id, action: "mfa_login_success", resource: "Authentication", description: "Customer successfully completed MFA verification.", severity: "medium" });

    return res.status(200).json({ success: true, mfaVerified: true, token, user: { ...user.toObject(), password: undefined, loginPinHash: undefined, loginPinExpiresAt: undefined, loginPinAttempts: undefined, loginPinLastSentAt: undefined, permissions, role: effectiveRole } });
  } catch (error) {
    next(error);
  }
};
