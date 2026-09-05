import crypto from "crypto";
import axios from "axios";
import { generateAccessToken, normalizePhoneNumber } from "./mpesaService.js";
import { mpesaConfig, getMpesaUrls } from "../config/mpesa.js";

const buildSecurityCredential = () => {
  if (mpesaConfig.b2cSecurityCredential) return mpesaConfig.b2cSecurityCredential;
  if (!mpesaConfig.b2cInitiatorPassword || !mpesaConfig.b2cCertificateBase64) {
    throw new Error("M-Pesa B2C is not configured. Set MPESA_B2C_SECURITY_CREDENTIAL or MPESA_B2C_INITIATOR_PASSWORD plus MPESA_B2C_CERTIFICATE_BASE64.");
  }
  const certificate = Buffer.from(mpesaConfig.b2cCertificateBase64, "base64").toString("utf8");
  return crypto.publicEncrypt(
    { key: certificate, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(mpesaConfig.b2cInitiatorPassword, "utf8"),
  ).toString("base64");
};

export const initiateMpesaB2CPayout = async ({ amount, phone, withdrawalId }) => {
  const numericAmount = Number(amount);
  if (!Number.isInteger(numericAmount) || numericAmount < 1) throw new Error("M-Pesa payout amount must be a whole KES amount of at least 1.");
  if (!withdrawalId) throw new Error("Withdrawal ID is required for an M-Pesa payout.");
  if (!mpesaConfig.b2cShortcode || !mpesaConfig.b2cInitiatorName || !mpesaConfig.b2cResultUrl || !mpesaConfig.b2cTimeoutUrl) {
    throw new Error("M-Pesa B2C is not configured. Add MPESA_B2C_SHORTCODE, MPESA_B2C_INITIATOR_NAME, MPESA_B2C_RESULT_URL and MPESA_B2C_TIMEOUT_URL in Render.");
  }

  const token = await generateAccessToken();
  const urls = getMpesaUrls();
  const normalizedPhone = normalizePhoneNumber(phone);
  const securityCredential = buildSecurityCredential();

  const payload = {
    InitiatorName: mpesaConfig.b2cInitiatorName,
    SecurityCredential: securityCredential,
    CommandID: mpesaConfig.b2cCommandId,
    Amount: numericAmount,
    PartyA: mpesaConfig.b2cShortcode,
    PartyB: normalizedPhone,
    Remarks: `Agent commission withdrawal ${withdrawalId}`.slice(0, 100),
    QueueTimeOutURL: mpesaConfig.b2cTimeoutUrl,
    ResultURL: mpesaConfig.b2cResultUrl,
    Occasion: `AGENT-${withdrawalId}`.slice(0, 100),
  };

  try {
    const { data } = await axios.post(urls.b2c, payload, {
      timeout: 30000,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!data?.ConversationID && !data?.OriginatorConversationID) {
      throw new Error(data?.ResponseDescription || data?.errorMessage || "Safaricom did not return a B2C conversation ID.");
    }
    return data;
  } catch (error) {
    console.error("MPESA B2C ERROR:", error.response?.data || error.message);
    throw new Error(error.response?.data?.errorMessage || error.response?.data?.ResponseDescription || error.message || "M-Pesa B2C payout failed.");
  }
};
