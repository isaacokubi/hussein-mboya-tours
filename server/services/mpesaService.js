/**
 * M-Pesa integration service. Keep Daraja authentication, request construction,
 * timeout/error normalization and STK Push transport logic here rather than in
 * route handlers. A successful initiation response is not proof of payment.
 * Never log access tokens, passkeys, full credentials or customer PINs.
 */

// Require an active tenant so payment settings are resolved in the correct organization.
import { requireTenantId } from "../tenancy/context.js";
// Read the tenant's company name for the payment description.
import { getSystemSettings } from "../services/settingsService.js";
// Use Axios to send HTTP requests to the Daraja API.
import axios from "axios";
// Hash credential configuration into a non-reversible token-cache key.
import { createHash } from "node:crypto";
// Load the tenant-specific credentials and API endpoints.
import { getTenantMpesaConfig, getTenantMpesaUrls } from "./paymentGatewayService.js";

// Create a reusable HTTP client with a finite default request timeout.
const mpesaClient = axios.create({ timeout: 30000 });
// Cache access tokens in memory so every payment request does not re-authenticate.
const tokenCache = new Map();

// Normalize and validate a Kenyan Safaricom phone number into 254XXXXXXXXX form.
export const normalizePhoneNumber = (phone) => {
  // Require tenant context before performing payment-related normalization.
  requireTenantId();
  // Reject an absent phone number before converting it to text.
  if (!phone) throw new Error("Phone number is required.");

  // Convert the value to text, trim surrounding whitespace and remove internal spaces.
  let normalized = phone.toString().trim().replace(/\s+/g, "");
  // Convert the international +254 prefix to the API's 254 prefix format.
  if (normalized.startsWith("+254")) normalized = normalized.substring(1);
  // Convert Kenyan local numbers beginning with 0 to the international 254 format.
  if (/^0[17]\d{8}$/.test(normalized)) normalized = "254" + normalized.substring(1);

  // Accept only supported Kenyan mobile-number formats after normalization.
  if (!/^254[17]\d{8}$/.test(normalized)) {
    // Reject invalid numbers instead of sending malformed payment requests.
    throw new Error("Invalid Safaricom phone number.");
  }
  // Return the validated number in the format expected by Daraja.
  return normalized;
};

// Request a Daraja OAuth access token, reusing a still-valid cached token when possible.
export const generateAccessToken = async (config = null, client = mpesaClient) => {
  // Use explicitly supplied configuration or load the active tenant's M-Pesa settings.
  const activeConfig = config || await getTenantMpesaConfig();
  // Resolve the correct authentication endpoint for the selected configuration/environment.
  const urls = getTenantMpesaUrls(activeConfig);
  // Require both OAuth credentials before making a network request.
  if (!activeConfig.consumerKey || !activeConfig.consumerSecret) throw new Error("M-Pesa credentials are not configured.");
  // Hash the credentials and endpoint to separate cache entries without storing raw secrets as keys.
  const cacheKey = createHash("sha256").update(`${activeConfig.consumerKey}:${activeConfig.consumerSecret}:${urls.auth}`).digest("hex");
  // Read the previously cached token for this exact credential/endpoint combination.
  const cached = tokenCache.get(cacheKey);
  // Reuse the token only when it remains valid for at least another thirty seconds.
  if (cached && cached.expiresAt > Date.now() + 30000) return cached.token;
  // Encode the OAuth client key and secret using HTTP Basic authentication format.
  const auth = Buffer.from(`${activeConfig.consumerKey}:${activeConfig.consumerSecret}`).toString("base64");

  try {
    // Ask Daraja for a fresh access token using the Basic authorization header.
    const { data } = await client.get(urls.auth, {
      // Send the encoded client credentials in the expected header.
      headers: { Authorization: `Basic ${auth}` },
      // Bound the authentication request independently of the shared client timeout.
      timeout: 10000,
    });
    // Reject an apparently successful response that contains no token.
    if (!data?.access_token) throw new Error("M-Pesa access token missing.");
    // Normalize the provider expiry, enforcing at least sixty seconds for cache calculations.
    const expiresIn = Math.max(60, Number(data.expires_in) || 3600);
    // Cache the token together with its calculated expiry timestamp.
    tokenCache.set(cacheKey, { token: data.access_token, expiresAt: Date.now() + expiresIn * 1000 });
    // Return the fresh token to the caller.
    return data.access_token;
  } catch (error) {
    // Log only the HTTP status; never log OAuth credentials or the token response.
    console.error("M-Pesa authentication failed:", {
      status: error.response?.status,
    });
    // Return a safe error message that does not expose provider secrets or internals.
    throw new Error("Unable to authenticate with M-Pesa.");
  }
};

// Produce the YYYYMMDDHHmmss timestamp format required by Daraja STK Push.
export const generateTimestamp = () => {
  // Capture the current local date and time.
  const now = new Date();
  // Join padded date/time parts into the fixed-width provider timestamp.
  return (
    now.getFullYear() + // Four-digit year.
    String(now.getMonth() + 1).padStart(2, "0") + // Month is zero-based in JavaScript, so add one.
    String(now.getDate()).padStart(2, "0") + // Day of month.
    String(now.getHours()).padStart(2, "0") + // Hour using the runtime's local timezone.
    String(now.getMinutes()).padStart(2, "0") + // Minute.
    String(now.getSeconds()).padStart(2, "0") // Second.
  );
};

// Generate the Base64 password from the shortcode, passkey and timestamp.
export const generatePassword = (timestamp, config = null) => {
  // Require tenant-specific shortcode/passkey configuration before constructing a password.
  if (!config) throw new Error("M-Pesa configuration is required to generate a password.");
  // Concatenate the required Daraja fields and encode them as Base64.
  return Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString("base64");
};

// Initiate an M-Pesa STK Push for the supplied booking and payer phone number.
export const initiateStkPush = async ({ phone, amount, bookingId, config: suppliedConfig = null, client = mpesaClient, companyName: suppliedCompanyName = "" }) => {
  // Prefer an explicitly supplied company name; otherwise load it from tenant settings.
  const companyName = suppliedCompanyName || (await getSystemSettings()).companyName || "Company";

  // Require a payer phone number before making any provider request.
  if (!phone) throw new Error("Phone number is required.");
  // Require a positive payment amount.
  if (!amount || amount <= 0) throw new Error("Invalid payment amount.");
  // Require a booking identifier so the payment can be correlated later.
  if (!bookingId) throw new Error("Booking ID is required.");

  // Use supplied gateway settings for controlled callers/tests, otherwise load tenant settings.
  const config = suppliedConfig || await getTenantMpesaConfig();
  // Resolve Daraja URLs for the selected tenant configuration.
  const urls = getTenantMpesaUrls(config);
  // Validate and normalize the phone number before sending it to the provider.
  const normalizedPhone = normalizePhoneNumber(phone);
  // Obtain a valid OAuth token for this configuration.
  const token = await generateAccessToken(config, client);
  // Generate the timestamp required by the STK Push password.
  const timestamp = generateTimestamp();
  // Build the provider password using the tenant's shortcode/passkey and timestamp.
  const password = generatePassword(timestamp, config);

  // Construct the Daraja STK Push request body.
  const payload = {
    BusinessShortCode: config.shortcode, // Business shortcode registered with M-Pesa.
    Password: password, // Encoded shortcode/passkey/timestamp value.
    Timestamp: timestamp, // Timestamp used to build the password.
    TransactionType: "CustomerPayBillOnline", // Daraja transaction type for customer STK payments.
    Amount: Math.round(amount), // Daraja expects a whole-number amount in the currency's smallest supported unit.
    PartyA: normalizedPhone, // Phone number that receives the PIN prompt and authorizes payment.
    PartyB: config.shortcode, // Merchant shortcode receiving the payment.
    PhoneNumber: normalizedPhone, // Payer phone number to prompt.
    CallBackURL: config.callbackUrl, // Public endpoint Daraja calls with the payment result.
    AccountReference: `BOOKING-${bookingId}`, // Booking reference used to reconcile the payment.
    TransactionDesc: `${companyName} Booking Payment`, // Description displayed for the payment request.
  };

  try {
    // Submit the STK request to Daraja using the OAuth bearer token.
    const { data } = await client.post(urls.stk, payload, {
      // Authorize the request with the access token.
      headers: { Authorization: `Bearer ${token}` },
      // Allow up to thirty seconds for the provider to respond.
      timeout: 30000,
    });
    // Require all identifiers and the success response code before treating initiation as accepted.
    if (!data || typeof data !== "object" || !data.CheckoutRequestID || !data.MerchantRequestID || String(data.ResponseCode) !== "0") {
      // Reject incomplete or unsuccessful provider responses so callers can mark initiation appropriately.
      throw new Error("M-Pesa returned an invalid STK Push response.");
    }

    // Log operational correlation details without logging credentials, tokens or customer PINs.
    console.info("M-Pesa STK request submitted:", {
      bookingId, // Booking associated with this request.
      amount: Math.round(amount), // Rounded amount submitted to Daraja.
      shortcode: config.shortcode, // Merchant shortcode used for this request.
      environment: config.environment, // Configured Daraja environment, such as sandbox or production.
      source: config.source, // Indicates which configuration source supplied the gateway settings.
      responseCode: data?.ResponseCode, // Provider response code for troubleshooting.
      checkoutRequestId: data?.CheckoutRequestID, // Provider correlation ID for status reconciliation.
    });

    // Return the provider response so the caller can persist its correlation identifiers.
    return data;
  } catch (error) {
    // Log the booking and HTTP status without logging the complete request or credentials.
    console.error("M-Pesa STK request failed:", {
      bookingId, // Booking affected by this initiation attempt.
      status: error.response?.status, // HTTP status if the provider returned one.
    });
    // Report that the result may be uncertain; callers should check status before retrying.
    throw new Error("STK Push failed or its result is uncertain. Check payment status before retrying.");
  }
};
