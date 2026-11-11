/**
 * Purpose: sms Service business-logic service. Main declarations: isLocalSmsFallbackEnabled, getSMSClient, sendSMS, sendBulkSMS.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load africastalking so this module can use its exported dependencies.
import AfricasTalking from "africastalking";

/*
|--------------------------------------------------------------------------
| AFRICA'S TALKING CONFIGURATION
|--------------------------------------------------------------------------
*/

// Declare isLocalSmsFallbackEnabled for use by the surrounding module or function.
const isLocalSmsFallbackEnabled = () =>
  process.env.NODE_ENV !== "production" &&
  String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true";

// Declare getSMSClient for use by the surrounding module or function.
const getSMSClient = () => {
  // Check the condition (!process.env.AT_API_KEY || !process.env.AT_USERNAME) and run the matching branch.
  if (!process.env.AT_API_KEY || !process.env.AT_USERNAME) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Africa's Talking credentials missing");
  }

  // Declare africasTalking for use by the surrounding module or function.
  const africasTalking = AfricasTalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
  });

  // Return the SMS value to the caller.
  return africasTalking.SMS;
};

/*
|--------------------------------------------------------------------------
| SEND SINGLE SMS
|--------------------------------------------------------------------------
*/

// Declare sendSMS for use by the surrounding module or function.
export const sendSMS = async (phone, message) => {
  // Check the condition (!phone) and run the matching branch.
  if (!phone) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Phone number is required.");
  }

  // Check the condition (!message) and run the matching branch.
  if (!message) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("SMS message is required.");
  }

  // Declare normalizedPhone for use by the surrounding module or function.
  const normalizedPhone = /^0\d{9}$/.test(String(phone).trim())
    ? `+254${String(phone).trim().slice(1)}`
    : String(phone).trim();

  // Check the condition (isLocalSmsFallbackEnabled() && (!process.env.AT_API_KEY || !process.en) and run the matching branch.
  if (isLocalSmsFallbackEnabled() && (!process.env.AT_API_KEY || !process.env.AT_USERNAME)) {
    // Perform the side effect or state update expressed on the following line.
    console.warn("============================================================");
    // Perform the side effect or state update expressed on the following line.
    console.warn("MFA DEV MODE: Africa's Talking is not configured.");
    // Perform the side effect or state update expressed on the following line.
    console.warn(`MFA DEV SMS -> ${normalizedPhone}: ${message}`);
    // Perform the side effect or state update expressed on the following line.
    console.warn("This fallback is disabled automatically when NODE_ENV=production.");
    // Perform the side effect or state update expressed on the following line.
    console.warn("============================================================");
    // Return the object assembled below to the caller.
    return { devMode: true, phone: normalizedPhone, message };
  }

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare sms for use by the surrounding module or function.
    const sms = getSMSClient();
    // Declare response for use by the surrounding module or function.
    const response = await sms.send({
      to: [normalizedPhone],
      message,
      from: process.env.AT_SENDER_ID || undefined,
    });

    // Perform the side effect or state update expressed on the following line.
    console.log(`SMS sent successfully to ${phone}`);
    // Return the value of response to the caller.
    return response;
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error(
      "SMS sending failed:",
      error.response?.data || error.message
    );
    // Stop the current operation by raising the value of error.
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| SEND BULK SMS
|--------------------------------------------------------------------------
*/

// Declare sendBulkSMS for use by the surrounding module or function.
export const sendBulkSMS = async (phones, message) => {
  // Check the condition (!Array.isArray(phones) || phones.length === 0) and run the matching branch.
  if (!Array.isArray(phones) || phones.length === 0) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("At least one phone number is required.");
  }

  // Check the condition (!message) and run the matching branch.
  if (!message) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("SMS message is required.");
  }

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare sms for use by the surrounding module or function.
    const sms = getSMSClient();
    // Declare response for use by the surrounding module or function.
    const response = await sms.send({
      to: phones,
      message,
      from: process.env.AT_SENDER_ID || undefined,
    });

    // Perform the side effect or state update expressed on the following line.
    console.log(`Bulk SMS sent to ${phones.length} recipients`);
    // Return the value of response to the caller.
    return response;
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error(
      "Bulk SMS failed:",
      error.response?.data || error.message
    );
    // Stop the current operation by raising the value of error.
    throw error;
  }
};
