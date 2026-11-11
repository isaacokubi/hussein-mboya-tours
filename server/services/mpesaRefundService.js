/**
 * Purpose: mpesa Refund Service business-logic service. Main declarations: getAccessToken, buildRefundCallbackUrls, requestMpesaRefund.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import axios from "axios";
// Load ./paymentGatewayService.js so this module can use its exported dependencies.
import { getTenantMpesaConfig, getTenantMpesaUrls } from "./paymentGatewayService.js";

// Declare getAccessToken for use by the surrounding module or function.
const getAccessToken = async (config, urls, client = axios) => {
  // Declare auth for use by the surrounding module or function.
  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
  // Declare response for use by the surrounding module or function.
  const response = await client.get(urls.auth, {
    headers: { Authorization: `Basic ${auth}` },
    timeout: 15000,
  });
  // Check the condition (!response.data?.access_token) and run the matching branch.
  if (!response.data?.access_token) throw new Error("M-Pesa access token missing.");
  // Return the access token value to the caller.
  return response.data.access_token;
};

// Declare buildRefundCallbackUrls for use by the surrounding module or function.
const buildRefundCallbackUrls = (callbackUrl) => {
  // Declare normalized for use by the surrounding module or function.
  const normalized = String(callbackUrl || "").trim().replace(/\/$/, "");
  // Declare base for use by the surrounding module or function.
  const base = normalized.replace(/\/callback$/i, "");
  // Return the object assembled below to the caller.
  return {
    resultUrl: `${base}/refund/result`,
    timeoutUrl: `${base}/refund/timeout`,
  };
};

// Declare requestMpesaRefund for use by the surrounding module or function.
export const requestMpesaRefund = async ({ transactionId, client = axios }) => {
  // Declare config for use by the surrounding module or function.
  const config = await getTenantMpesaConfig();
  // Declare urls for use by the surrounding module or function.
  const urls = getTenantMpesaUrls(config);

  // Check the condition (!config.initiatorName || !config.securityCredential) and run the matching branch.
  if (!config.initiatorName || !config.securityCredential) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Tenant M-Pesa refund credentials are not configured.");
  }

  // Check the condition (!config.callbackUrl) and run the matching branch.
  if (!config.callbackUrl) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Tenant M-Pesa callback URL is not configured.");
  }

  // Declare originalTransactionId for use by the surrounding module or function.
  const originalTransactionId = String(transactionId || "").trim();
  // Check the condition (!originalTransactionId) and run the matching branch.
  if (!originalTransactionId) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Original M-Pesa transaction ID is required for a refund.");
  }

  // Declare { resultUrl, timeoutUrl } for use by the surrounding module or function.
  const { resultUrl, timeoutUrl } = buildRefundCallbackUrls(config.callbackUrl);
  // Declare token for use by the surrounding module or function.
  const token = await getAccessToken(config, urls, client);

  // Declare response for use by the surrounding module or function.
  const response = await client.post(
    urls.reversal,
    {
      Initiator: config.initiatorName,
      SecurityCredential: config.securityCredential,
      CommandID: "TransactionReversal",
      TransactionID: originalTransactionId,
      ReceiverParty: config.shortcode,
      ReceiverPartyType: "11",
      ResultURL: resultUrl,
      QueueTimeOutURL: timeoutUrl,
      Remarks: `Refund reversal for ${originalTransactionId}`,
      Occasion: "Customer refund",
    },
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 20000,
    }
  );

  // Return the data value to the caller.
  return response.data;
};

// Expose the selected declarations or re-exported members to other parts of the application.
export { buildRefundCallbackUrls };
