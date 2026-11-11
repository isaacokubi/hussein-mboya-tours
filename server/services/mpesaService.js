/**
 * Purpose: mpesa Service business-logic service. Main declarations: normalizePhoneNumber, generateAccessToken, generateTimestamp, generatePassword, initiateStkPush.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { requireTenantId } from "../tenancy/context.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load axios so this module can use its exported dependencies.
import axios from "axios";
// Load node:crypto so this module can use its exported dependencies.
import { createHash } from "node:crypto";
// Load ./paymentGatewayService.js so this module can use its exported dependencies.
import { getTenantMpesaConfig, getTenantMpesaUrls } from "./paymentGatewayService.js";

// Declare mpesaClient for use by the surrounding module or function.
const mpesaClient = axios.create({ timeout: 30000 });
// Declare tokenCache for use by the surrounding module or function.
const tokenCache = new Map();

// Declare normalizePhoneNumber for use by the surrounding module or function.
export const normalizePhoneNumber = (phone) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Check the condition (!phone) and run the matching branch.
  if (!phone) throw Object.assign(new Error("Phone number is required."), { status: 400, code: "INVALID_MPESA_PHONE", expose: true });

  // Declare normalized for use by the surrounding module or function.
  let normalized = phone.toString().trim().replace(/\s+/g, "");
  // Check the condition (normalized.startsWith("+254")) and run the matching branch.
  if (normalized.startsWith("+254")) normalized = normalized.substring(1);
  // Check the condition (/^0[17]\d{8}$/.test(normalized)) and run the matching branch.
  if (/^0[17]\d{8}$/.test(normalized)) normalized = "254" + normalized.substring(1);

  // Check the condition (!/^254[17]\d{8}$/.test(normalized)) and run the matching branch.
  if (!/^254[17]\d{8}$/.test(normalized)) {
    // Stop the current operation by raising the result of Object.assign().
    throw Object.assign(new Error("Invalid Safaricom phone number."), { status: 400, code: "INVALID_MPESA_PHONE", expose: true });
  }
  // Return the value of normalized to the caller.
  return normalized;
};

// Declare generateAccessToken for use by the surrounding module or function.
export const generateAccessToken = async (config = null, client = mpesaClient) => {
  // Declare activeConfig for use by the surrounding module or function.
  const activeConfig = config || await getTenantMpesaConfig();
  // Declare urls for use by the surrounding module or function.
  const urls = getTenantMpesaUrls(activeConfig);
  // Check the condition (!activeConfig.consumerKey || !activeConfig.consumerSecret) and run the matching branch.
  if (!activeConfig.consumerKey || !activeConfig.consumerSecret) throw new Error("M-Pesa credentials are not configured.");
  // Declare cacheKey for use by the surrounding module or function.
  const cacheKey = createHash("sha256").update(`${activeConfig.consumerKey}:${activeConfig.consumerSecret}:${urls.auth}`).digest("hex");
  // Declare cached for use by the surrounding module or function.
  const cached = tokenCache.get(cacheKey);
  // Check the condition (cached && cached.expiresAt > Date.now() + 30000) and run the matching branch.
  if (cached && cached.expiresAt > Date.now() + 30000) return cached.token;
  // Declare auth for use by the surrounding module or function.
  const auth = Buffer.from(`${activeConfig.consumerKey}:${activeConfig.consumerSecret}`).toString("base64");

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { data } for use by the surrounding module or function.
    const { data } = await client.get(urls.auth, {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 10000,
    });
    // Check the condition (!data?.access_token) and run the matching branch.
    if (!data?.access_token) throw new Error("M-Pesa access token missing.");
    // Declare expiresIn for use by the surrounding module or function.
    const expiresIn = Math.max(60, Number(data.expires_in) || 3600);
    // Perform the side effect or state update expressed on the following line.
    tokenCache.set(cacheKey, { token: data.access_token, expiresAt: Date.now() + expiresIn * 1000 });
    // Return the access token value to the caller.
    return data.access_token;
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("M-Pesa authentication failed:", {
      status: error.response?.status,
    });
    // Stop the current operation by raising a new Error instance.
    throw new Error("Unable to authenticate with M-Pesa.");
  }
};

// Declare generateTimestamp for use by the surrounding module or function.
export const generateTimestamp = () => {
  // Declare now for use by the surrounding module or function.
  const now = new Date();
  // Return the expression shown below to the caller.
  return (
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0")
  );
};

// Declare generatePassword for use by the surrounding module or function.
export const generatePassword = (timestamp, config = null) => {
  // Check the condition (!config) and run the matching branch.
  if (!config) throw new Error("M-Pesa configuration is required to generate a password.");
  // Return the result of Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString() to the caller.
  return Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString("base64");
};

// Declare initiateStkPush for use by the surrounding module or function.
export const initiateStkPush = async ({ phone, amount, bookingId, config: suppliedConfig = null, client = mpesaClient, companyName: suppliedCompanyName = "" }) => {
  // Declare companyName for use by the surrounding module or function.
  const companyName = suppliedCompanyName || (await getSystemSettings()).companyName || "Company";

  // Check the condition (!phone) and run the matching branch.
  if (!phone) throw new Error("Phone number is required.");
  // Check the condition (!Number.isSafeInteger(Number(amount)) || Number(amount) <= 0) and run the matching branch.
  if (!Number.isSafeInteger(Number(amount)) || Number(amount) <= 0) throw Object.assign(new Error("Invalid payment amount."), { status: 400, code: "INVALID_MPESA_AMOUNT", expose: true });
  // Check the condition (!bookingId) and run the matching branch.
  if (!bookingId) throw new Error("Booking ID is required.");

  // Declare config for use by the surrounding module or function.
  const config = suppliedConfig || await getTenantMpesaConfig();
  // Declare urls for use by the surrounding module or function.
  const urls = getTenantMpesaUrls(config);
  // Declare normalizedPhone for use by the surrounding module or function.
  const normalizedPhone = normalizePhoneNumber(phone);
  // Declare token for use by the surrounding module or function.
  const token = await generateAccessToken(config, client);
  // Declare timestamp for use by the surrounding module or function.
  const timestamp = generateTimestamp();
  // Declare password for use by the surrounding module or function.
  const password = generatePassword(timestamp, config);

  // Declare payload for use by the surrounding module or function.
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

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { data } for use by the surrounding module or function.
    const { data } = await client.post(urls.stk, payload, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000,
    });
    // Check the condition (!data || typeof data !== "object" || !data.CheckoutRequestID || !data.) and run the matching branch.
    if (!data || typeof data !== "object" || !data.CheckoutRequestID || !data.MerchantRequestID || String(data.ResponseCode) !== "0") {
      // Stop the current operation by raising a new Error instance.
      throw new Error("M-Pesa returned an invalid STK Push response.");
    }

    // Perform the side effect or state update expressed on the following line.
    console.info("M-Pesa STK request submitted:", {
      bookingId,
      amount: Math.round(amount),
      shortcode: config.shortcode,
      environment: config.environment,
      source: config.source,
      responseCode: data?.ResponseCode,
      checkoutRequestId: data?.CheckoutRequestID,
    });

    // Return the value of data to the caller.
    return data;
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("M-Pesa STK request failed:", {
      bookingId,
      status: error.response?.status,
    });
    // Declare safeError for use by the surrounding module or function.
    const safeError = new Error("STK Push failed or its result is uncertain. Check payment status before retrying.");
    // Perform the side effect or state update expressed on the following line.
    safeError.status = error.response?.status || 502;
    // Perform the side effect or state update expressed on the following line.
    safeError.code = error.response ? "MPESA_PROVIDER_REJECTED" : "MPESA_REQUEST_UNCERTAIN";
    // Stop the current operation by raising the value of safeError.
    throw safeError;
  }
};
