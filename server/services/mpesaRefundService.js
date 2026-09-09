import axios from "axios";
import { getTenantMpesaConfig, getTenantMpesaUrls } from "./paymentGatewayService.js";

const getAccessToken = async (config, urls) => {
  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
  const response = await axios.get(urls.auth, {
    headers: { Authorization: `Basic ${auth}` },
    timeout: 15000,
  });
  return response.data.access_token;
};

export const requestMpesaRefund = async ({ amount, phone, transactionId }) => {
  const config = await getTenantMpesaConfig();
  const urls = getTenantMpesaUrls(config);

  if (!config.initiatorName || !config.securityCredential) {
    throw new Error("Tenant M-Pesa refund credentials are not configured.");
  }

  if (!config.callbackUrl) {
    throw new Error("Tenant M-Pesa callback URL is not configured.");
  }

  const token = await getAccessToken(config, urls);

  const response = await axios.post(
    urls.b2c,
    {
      InitiatorName: config.initiatorName,
      SecurityCredential: config.securityCredential,
      CommandID: "BusinessPayment",
      Amount: Number(amount),
      PartyA: config.shortcode,
      PartyB: phone,
      Remarks: `Refund ${transactionId}`,
      QueueTimeOutURL: `${config.callbackUrl.replace(/\/$/, "")}/refund/timeout`,
      ResultURL: `${config.callbackUrl.replace(/\/$/, "")}/refund/result`,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 20000,
    }
  );

  return response.data;
};
