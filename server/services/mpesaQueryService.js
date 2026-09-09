import axios from "axios";
import { getTenantMpesaConfig, getTenantMpesaUrls } from "./paymentGatewayService.js";
import { generateAccessToken, generateTimestamp, generatePassword } from "./mpesaService.js";

const client = axios.create({ timeout: 30000 });

export async function queryStkPush(checkoutRequestID, suppliedConfig = null) {
  const checkoutId = String(checkoutRequestID || "").trim();
  if (!checkoutId) throw new Error("CheckoutRequestID is required.");

  const config = suppliedConfig || await getTenantMpesaConfig();
  const urls = getTenantMpesaUrls(config);
  const timestamp = generateTimestamp();
  const token = await generateAccessToken(config);
  const password = generatePassword(timestamp, config);

  try {
    const { data } = await client.post(urls.query, {
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutId,
    }, { headers: { Authorization: `Bearer ${token}` } });

    return data;
  } catch (error) {
    console.error("M-Pesa STK query failed:", {
      checkoutRequestID: checkoutId,
      status: error.response?.status,
      message: error.response?.data?.errorMessage || error.response?.data?.errorCode || error.message,
    });
    throw new Error(error.response?.data?.errorMessage || error.response?.data?.errorCode || "Unable to query M-Pesa payment status.");
  }
}

export function classifyStkQueryResult(resultCode) {
  const code = String(resultCode ?? "").trim();
  if (code === "0") return "completed";
  if (["1032", "1037"].includes(code)) return "cancelled";
  if (["1036", "1", "2001"].includes(code)) return "failed";
  return "pending";
}
