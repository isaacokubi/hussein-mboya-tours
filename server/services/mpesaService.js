import { requireTenantId } from "../tenancy/context.js";
import { getSystemSettings } from "../services/settingsService.js";
import axios from "axios";
import { createHash } from "node:crypto";
import { getTenantMpesaConfig, getTenantMpesaUrls } from "./paymentGatewayService.js";

const mpesaClient = axios.create({ timeout: 30000 });
const tokenCache = new Map();

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

export const generateAccessToken = async (config = null, client = mpesaClient) => {
  const activeConfig = config || await getTenantMpesaConfig();
  const urls = getTenantMpesaUrls(activeConfig);
  if (!activeConfig.consumerKey || !activeConfig.consumerSecret) throw new Error("M-Pesa credentials are not configured.");
  const cacheKey = createHash("sha256").update(`${activeConfig.consumerKey}:${activeConfig.consumerSecret}:${urls.auth}`).digest("hex");
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 30000) return cached.token;
  const auth = Buffer.from(`${activeConfig.consumerKey}:${activeConfig.consumerSecret}`).toString("base64");

  try {
    const { data } = await client.get(urls.auth, {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 10000,
    });
    if (!data?.access_token) throw new Error("M-Pesa access token missing.");
    const expiresIn = Math.max(60, Number(data.expires_in) || 3600);
    tokenCache.set(cacheKey, { token: data.access_token, expiresAt: Date.now() + expiresIn * 1000 });
    return data.access_token;
  } catch (error) {
    console.error("M-Pesa authentication failed:", {
      status: error.response?.status,
    });
    throw new Error("Unable to authenticate with M-Pesa.");
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

export const initiateStkPush = async ({ phone, amount, bookingId, config: suppliedConfig = null, client = mpesaClient, companyName: suppliedCompanyName = "" }) => {
  const companyName = suppliedCompanyName || (await getSystemSettings()).companyName || "Company";

  if (!phone) throw new Error("Phone number is required.");
  if (!amount || amount <= 0) throw new Error("Invalid payment amount.");
  if (!bookingId) throw new Error("Booking ID is required.");

  const config = suppliedConfig || await getTenantMpesaConfig();
  const urls = getTenantMpesaUrls(config);
  const normalizedPhone = normalizePhoneNumber(phone);
  const token = await generateAccessToken(config, client);
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
    const { data } = await client.post(urls.stk, payload, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000,
    });
    if (!data || typeof data !== "object" || !data.CheckoutRequestID || !data.MerchantRequestID || String(data.ResponseCode) !== "0") {
      throw new Error("M-Pesa returned an invalid STK Push response.");
    }

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
    });
    throw new Error("STK Push failed or its result is uncertain. Check payment status before retrying.");
  }
};
