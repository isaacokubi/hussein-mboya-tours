import axios from "axios";
import { getTenantMpesaConfig, getTenantMpesaUrls } from "./paymentGatewayService.js";

const getAccessToken = async (config, urls, client = axios) => {
  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
  const response = await client.get(urls.auth, {
    headers: { Authorization: `Basic ${auth}` },
    timeout: 15000,
  });
  if (!response.data?.access_token) throw new Error("M-Pesa access token missing.");
  return response.data.access_token;
};

const buildRefundCallbackUrls = (callbackUrl) => {
  const normalized = String(callbackUrl || "").trim().replace(/\/$/, "");
  const base = normalized.replace(/\/callback$/i, "");
  return {
    resultUrl: `${base}/refund/result`,
    timeoutUrl: `${base}/refund/timeout`,
  };
};

export const requestMpesaRefund = async ({ transactionId, client = axios }) => {
  const config = await getTenantMpesaConfig();
  const urls = getTenantMpesaUrls(config);

  if (!config.initiatorName || !config.securityCredential) {
    throw new Error("Tenant M-Pesa refund credentials are not configured.");
  }

  if (!config.callbackUrl) {
    throw new Error("Tenant M-Pesa callback URL is not configured.");
  }

  const originalTransactionId = String(transactionId || "").trim();
  if (!originalTransactionId) {
    throw new Error("Original M-Pesa transaction ID is required for a refund.");
  }

  const { resultUrl, timeoutUrl } = buildRefundCallbackUrls(config.callbackUrl);
  const token = await getAccessToken(config, urls, client);

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

  return response.data;
};

export { buildRefundCallbackUrls };
