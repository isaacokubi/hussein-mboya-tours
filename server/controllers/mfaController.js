import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  generateLoginPin,
  hashLoginPin,
  verifyLoginPin,
  normalizeMfaPhone,
} from "../services/mfaService.js";

import * as smsService from "../services/smsService.js";

/**
 * Send SMS through the project's existing SMS service.
 *
 * The adapter checks the common function names used by the
 * existing project so the MFA feature does not introduce
 * another SMS provider.
 */
const sendMfaSms = async (phone, message) => {
  const normalizedPhone = normalizeMfaPhone(phone);

  if (!normalizedPhone) {
    throw new Error("User does not have a registered phone number.");
  }

  const sender =
    smsService.sendSMS ||
    smsService.sendSms ||
    smsService.sendSMSMessage ||
    smsService.sendMessage;

  if (typeof sender !== "function") {
    throw new Error(
      "No supported SMS sending function was found in smsService.js."
    );
  }

  return sender(normalizedPhone, message);
};

/**
 * Start customer MFA challenge.
 *
 * This endpoint receives a verified email/password result,
 * generates a 4-digit PIN, stores only its hash, then sends
 * the PIN to the registered phone.
 */
export const sendCustomerLoginPin = async (req, res, next) => {
  try {
    const {
      userId,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "MFA user ID is required.",
      });
    }

    const user = await User.findById(userId)
      .select(
        "+loginPinHash +loginPinExpiresAt +loginPinAttempts +loginPinLastSentAt"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const phone = normalizeMfaPhone(user.phone);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "This account does not have a registered phone number.",
      });
    }

    const now = Date.now();

    // Prevent rapid repeated PIN generation.
    if (
      user.loginPinLastSentAt &&
      now - new Date(user.loginPinLastSentAt).getTime() < 30 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another PIN.",
      });
    }

    const pin = generateLoginPin();

    user.loginPinHash = await hashLoginPin(pin);
    user.loginPinExpiresAt = new Date(now + 5 * 60 * 1000);
    user.loginPinAttempts = 0;
    user.loginPinLastSentAt = new Date();

    await user.save();

    await sendMfaSms(
      phone,
      `Your Coherent Tours login PIN is ${pin}. It expires in 5 minutes. Do not share this PIN with anyone.`
    );

    return res.json({
      success: true,
      message: "A 4-digit verification PIN has been sent to your registered phone.",
      mfaRequired: true,
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify the 4-digit customer MFA PIN.
 */
export const verifyCustomerLoginPin = async (req, res, next) => {
  try {
    const {
      userId,
      pin,
    } = req.body;

    if (!userId || !pin) {
      return res.status(400).json({
        success: false,
        message: "User ID and 4-digit PIN are required.",
      });
    }

    if (!/^\d{4}$/.test(String(pin))) {
      return res.status(400).json({
        success: false,
        message: "PIN must contain exactly 4 digits.",
      });
    }

    const user = await User.findById(userId)
      .select(
        "+password +loginPinHash +loginPinExpiresAt +loginPinAttempts +loginPinLastSentAt"
      );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid MFA request.",
      });
    }

    if (!user.loginPinHash || !user.loginPinExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "No active login PIN exists. Request a new PIN.",
      });
    }

    if (new Date(user.loginPinExpiresAt).getTime() < Date.now()) {
      user.loginPinHash = undefined;
      user.loginPinExpiresAt = undefined;
      user.loginPinAttempts = 0;

      await user.save();

      return res.status(401).json({
        success: false,
        message: "The login PIN has expired. Request a new PIN.",
      });
    }

    if (Number(user.loginPinAttempts || 0) >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect PIN attempts. Request a new PIN.",
      });
    }

    const valid = await verifyLoginPin(
      String(pin),
      user.loginPinHash
    );

    if (!valid) {
      user.loginPinAttempts =
        Number(user.loginPinAttempts || 0) + 1;

      await user.save();

      return res.status(401).json({
        success: false,
        message: "Incorrect verification PIN.",
        attemptsRemaining: Math.max(
          0,
          5 - Number(user.loginPinAttempts || 0)
        ),
      });
    }

    // Consume the PIN immediately.
    user.loginPinHash = undefined;
    user.loginPinExpiresAt = undefined;
    user.loginPinAttempts = 0;

    await user.save();

    return res.json({
      success: true,
      mfaVerified: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
