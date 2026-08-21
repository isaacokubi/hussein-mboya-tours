import { mergeTenantFilter } from "../tenancy/context.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const generateLoginPin = () =>
  crypto.randomInt(1000, 10000).toString();

export const hashLoginPin = async (pin) =>
  bcrypt.hash(String(pin), 10);

export const verifyLoginPin = async (pin, hash) => {
  if (!pin || !hash) return false;
  return bcrypt.compare(String(pin), String(hash));
};

export const normalizeMfaPhone = (phone) => {
  let value = String(phone || "").trim().replace(/\s+/g, "");

  if (value.startsWith("+254")) value = `0${value.slice(4)}`;
  else if (value.startsWith("254")) value = `0${value.slice(3)}`;

  return /^\d{10}$/.test(value) ? value : "";
};
