import { mergeTenantFilter } from "../tenancy/context.js";
import AfricasTalking from "africastalking";

/*
|--------------------------------------------------------------------------
| AFRICA'S TALKING CONFIGURATION
|--------------------------------------------------------------------------
*/

const isLocalSmsFallbackEnabled = () =>
  process.env.NODE_ENV !== "production" &&
  String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true";

const getSMSClient = () => {
  if (!process.env.AT_API_KEY || !process.env.AT_USERNAME) {
    throw new Error("Africa's Talking credentials missing");
  }

  const africasTalking = AfricasTalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
  });

  return africasTalking.SMS;
};

/*
|--------------------------------------------------------------------------
| SEND SINGLE SMS
|--------------------------------------------------------------------------
*/

export const sendSMS = async (phone, message) => {
  if (!phone) {
    throw new Error("Phone number is required.");
  }

  if (!message) {
    throw new Error("SMS message is required.");
  }

  const normalizedPhone = /^0\d{9}$/.test(String(phone).trim())
    ? `+254${String(phone).trim().slice(1)}`
    : String(phone).trim();

  if (isLocalSmsFallbackEnabled() && (!process.env.AT_API_KEY || !process.env.AT_USERNAME)) {
    console.warn("============================================================");
    console.warn("MFA DEV MODE: Africa's Talking is not configured.");
    console.warn(`MFA DEV SMS -> ${normalizedPhone}: ${message}`);
    console.warn("This fallback is disabled automatically when NODE_ENV=production.");
    console.warn("============================================================");
    return { devMode: true, phone: normalizedPhone, message };
  }

  try {
    const sms = getSMSClient();
    const response = await sms.send({
      to: [normalizedPhone],
      message,
      from: process.env.AT_SENDER_ID || undefined,
    });

    console.log(`SMS sent successfully to ${phone}`);
    return response;
  } catch (error) {
    console.error(
      "SMS sending failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| SEND BULK SMS
|--------------------------------------------------------------------------
*/

export const sendBulkSMS = async (phones, message) => {
  if (!Array.isArray(phones) || phones.length === 0) {
    throw new Error("At least one phone number is required.");
  }

  if (!message) {
    throw new Error("SMS message is required.");
  }

  try {
    const sms = getSMSClient();
    const response = await sms.send({
      to: phones,
      message,
      from: process.env.AT_SENDER_ID || undefined,
    });

    console.log(`Bulk SMS sent to ${phones.length} recipients`);
    return response;
  } catch (error) {
    console.error(
      "Bulk SMS failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
