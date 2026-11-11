/**
 * Purpose: mpesa Query Service business-logic service. Main declarations: queryStkPush, classifyStkQueryResult.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import axios from "axios";
// Load ./paymentGatewayService.js so this module can use its exported dependencies.
import { getTenantMpesaConfig, getTenantMpesaUrls } from "./paymentGatewayService.js";
// Load ./mpesaService.js so this module can use its exported dependencies.
import { generateAccessToken, generateTimestamp, generatePassword } from "./mpesaService.js";

// Declare client for use by the surrounding module or function.
const client = axios.create({ timeout: 30000 });

// Define queryStkPush; its parameters and body implement this operation.
export async function queryStkPush(checkoutRequestID, suppliedConfig = null) {
  // Declare checkoutId for use by the surrounding module or function.
  const checkoutId = String(checkoutRequestID || "").trim();
  // Check the condition (!checkoutId) and run the matching branch.
  if (!checkoutId) throw new Error("CheckoutRequestID is required.");

  // Declare config for use by the surrounding module or function.
  const config = suppliedConfig || await getTenantMpesaConfig();
  // Declare urls for use by the surrounding module or function.
  const urls = getTenantMpesaUrls(config);
  // Declare timestamp for use by the surrounding module or function.
  const timestamp = generateTimestamp();
  // Declare token for use by the surrounding module or function.
  const token = await generateAccessToken(config);
  // Declare password for use by the surrounding module or function.
  const password = generatePassword(timestamp, config);

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { data } for use by the surrounding module or function.
    const { data } = await client.post(urls.query, {
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutId,
    }, { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 });

    // Return the value of data to the caller.
    return data;
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("M-Pesa STK query failed:", {
      checkoutRequestID: checkoutId,
      status: error.response?.status,
    });
    // Stop the current operation by raising a new Error instance.
    throw new Error("Unable to query M-Pesa payment status.");
  }
}

// Define classifyStkQueryResult; its parameters and body implement this operation.
export function classifyStkQueryResult(resultCode) {
  // Declare code for use by the surrounding module or function.
  const code = String(resultCode ?? "").trim();
  // Check the condition (code === "0") and run the matching branch.
  if (code === "0") return "completed";
  // Check the condition (["1032", "1037"].includes(code)) and run the matching branch.
  if (["1032", "1037"].includes(code)) return "cancelled";
  // Check the condition (["1036", "1", "2001"].includes(code)) and run the matching branch.
  if (["1036", "1", "2001"].includes(code)) return "failed";
  // Return a configured text value to the caller.
  return "pending";
}
