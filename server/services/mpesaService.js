import { requireTenantId } from "../tenancy/context.js";
import { getSystemSettings } from "../services/settingsService.js";
import axios from "axios";
import { getTenantMpesaConfig, getTenantMpesaUrls } from "./paymentGatewayService.js";

const mpesaClient = axios.create({ timeout: 30000 });

export const normalizePhoneNumber = (phone) => {
  requireTenantId();
  if (!phone) throw new Error("Phone number is required.");

  let normalized = phone.toString().trim().replace(/\s+/g, "");
  if (normalized.startsWith("+254")) normalized = normalized.substring(1);
  if (/^0[17]\d{8}$/.test(normalized)) normalized = "254" + normalized.substring(1);

  if (!/^254[17]\d{8}$/.test(normalized)) {
    throw new Error("Invalid Safaricom phone number.");
  }
  return normalized;
};

export const generateAccessToken = async (config = null) => {
  const activeConfig = config || await getTenantMpesaConfig();
  const urls = getTenantMpesaUrls(activeConfig);
  const auth = Buffer.from(`${activeConfig.consumerKey}:${activeConfig.consumerSecret}`).toString("base64");

  try {
    const { data } = await mpesaClient.get(urls.auth, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!data.access_token) throw new Error("M-Pesa access token missing.");
    return data.access_token;
  } catch (error) {
    console.error("M-Pesa authentication failed:", {
      status: error.response?.status,
      message: error.response?.data?.errorMessage || error.response?.data?.error || error.message,
    });
    throw new Error(
      error.response?.data?.errorMessage ||
      error.response?.data?.error ||
      "Unable to authenticate with M-Pesa."
    );
  }
};

export const generateTimestamp = () => {
  const now = new Date();
  return (
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0")
  );
};

export const generatePassword = (timestamp, config = null) => {
  if (!config) throw new Error("M-Pesa configuration is required to generate a password.");
  return Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString("base64");
};

export const initiateStkPush = async ({ phone, amount, bookingId }) => {
  const settings = await getSystemSettings();
  const companyName = settings.companyName || "Company";

  if (!phone) throw new Error("Phone number is required.");
  if (!amount || amount <= 0) throw new Error("Invalid payment amount.");
  if (!bookingId) throw new Error("Booking ID is required.");

  const config = await getTenantMpesaConfig();
  const urls = getTenantMpesaUrls(config);
  const normalizedPhone = normalizePhoneNumber(phone);
  const token = await generateAccessToken(config);
  const timestamp = generateTimestamp();
  const password = generatePassword(timestamp, config);

  const payload = {
    BusinessShortCode: config.shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(amount),
    PartyA: normalizedPhone,
    PartyB: config.shortcode,
    PhoneNumber: normalizedPhone,
    CallBackURL: config.callbackUrl,
    AccountReference: `BOOKING-${bookingId}`,
    TransactionDesc: `${companyName} Booking Payment`,
  };

  try {
    const { data } = await mpesaClient.post(urls.stk, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.info("M-Pesa STK request submitted:", {
      bookingId,
      amount: Math.round(amount),
      shortcode: config.shortcode,
      environment: config.environment,
      source: config.source,
      responseCode: data?.ResponseCode,
      checkoutRequestId: data?.CheckoutRequestID,
    });

    return data;
  } catch (error) {
    console.error("M-Pesa STK request failed:", {
      bookingId,
      status: error.response?.status,
      message: error.response?.data?.errorMessage || error.response?.data?.errorCode || error.message,
    });

    throw new Error(
      error.response?.data?.errorMessage ||
      error.response?.data?.errorCode ||
      "STK Push failed."
    );
  }
};
