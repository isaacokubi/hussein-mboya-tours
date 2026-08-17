import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Generate a cryptographically secure 4-digit login PIN.
 */
export const generateLoginPin = () => {
  return crypto.randomInt(1000, 10000).toString();
};

/**
 * Hash the PIN before storing it.
 */
export const hashLoginPin = async (pin) => {
  return bcrypt.hash(String(pin), 10);
};

/**
 * Verify submitted PIN against stored hash.
 */
export const verifyLoginPin = async (pin, hash) => {
  if (!pin || !hash) return false;

  return bcrypt.compare(
    String(pin),
    String(hash)
  );
};

/**
 * Normalize Kenyan phone numbers.
 */
export const normalizeMfaPhone = (phone) => {
  const value = String(phone || "").trim();

  if (!value) return "";

  if (value.startsWith("+254")) {
    return `0${value.slice(4)}`;
  }

  if (value.startsWith("254")) {
    return `0${value.slice(3)}`;
  }

  return value;
};
