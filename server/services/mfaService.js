/**
 * Purpose: mfa Service business-logic service. Main declarations: generateLoginPin, hashLoginPin, verifyLoginPin, normalizeMfaPhone.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load crypto so this module can use its exported dependencies.
import crypto from "crypto";
// Load bcryptjs so this module can use its exported dependencies.
import bcrypt from "bcryptjs";

// Declare generateLoginPin for use by the surrounding module or function.
export const generateLoginPin = () =>
  crypto.randomInt(1000, 10000).toString();

// Declare hashLoginPin for use by the surrounding module or function.
export const hashLoginPin = async (pin) =>
  bcrypt.hash(String(pin), 10);

// Declare verifyLoginPin for use by the surrounding module or function.
export const verifyLoginPin = async (pin, hash) => {
  // Check the condition (!pin || !hash) and run the matching branch.
  if (!pin || !hash) return false;
  // Return the result of bcrypt.compare() to the caller.
  return bcrypt.compare(String(pin), String(hash));
};

// Declare normalizeMfaPhone for use by the surrounding module or function.
export const normalizeMfaPhone = (phone) => {
  // Declare value for use by the surrounding module or function.
  let value = String(phone || "").trim().replace(/\s+/g, "");

  // Check the condition (value.startsWith("+254")) and run the matching branch.
  if (value.startsWith("+254")) value = `0${value.slice(4)}`;
  else if (value.startsWith("254")) value = `0${value.slice(3)}`;

  // Return the expression shown below to the caller.
  return /^\d{10}$/.test(value) ? value : "";
};
