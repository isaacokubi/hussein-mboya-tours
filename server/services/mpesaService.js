import axios from "axios";

import { mpesaConfig, mpesaUrls } from "../config/mpesa.js";

/*
|--------------------------------------------------------------------------
| AXIOS CLIENT
|--------------------------------------------------------------------------
*/

const mpesaClient = axios.create({
  timeout: 30000,
});

/*
|--------------------------------------------------------------------------
| NORMALIZE PHONE NUMBER
|--------------------------------------------------------------------------
|
| Converts:
| 0712345678
| +254712345678
| 254712345678
|
| Into:
| 254712345678
|
*/

export const normalizePhoneNumber = (phone) => {
  if (!phone) {
    throw new Error("Phone number is required.");
  }

  let normalized = phone.toString().trim();

  normalized = normalized.replace(/\s+/g, "");

  if (normalized.startsWith("+254")) {
    normalized = normalized.substring(1);
  }

  if (normalized.startsWith("07")) {
    normalized = `254${normalized.substring(1)}`;
  }

  if (!/^2547\d{8}$/.test(normalized)) {
    throw new Error("Invalid Safaricom phone number.");
  }

  return normalized;
};

/*
|--------------------------------------------------------------------------
| ACCESS TOKEN
|--------------------------------------------------------------------------
*/

export const generateAccessToken = async () => {
  const auth = Buffer.from(
    `${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`,
  ).toString("base64");

  try {
    const { data } = await mpesaClient.get(mpesaUrls.oauth, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!data.access_token) {
      throw new Error("Failed to obtain M-Pesa access token.");
    }

    return data.access_token;
  } catch (error) {
    throw new Error(
      error.response?.data?.errorMessage ||
        "Unable to authenticate with M-Pesa.",
    );
  }
};

/*
|--------------------------------------------------------------------------
| TIMESTAMP
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| PASSWORD
|--------------------------------------------------------------------------
*/

export const generatePassword = (timestamp) =>
  Buffer.from(
    `${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`,
  ).toString("base64");

/*
|--------------------------------------------------------------------------
| STK PUSH
|--------------------------------------------------------------------------
*/

export const stkPush = async ({ phone, amount, bookingId }) => {
  if (!bookingId) {
    throw new Error("Booking ID is required.");
  }

  if (!amount || amount <= 0) {
    throw new Error("Invalid payment amount.");
  }

  const normalizedPhone = normalizePhoneNumber(phone);

  const token = await generateAccessToken();

  const timestamp = generateTimestamp();

  const password = generatePassword(timestamp);

  const payload = {
    BusinessShortCode: mpesaConfig.shortcode,

    Password: password,

    Timestamp: timestamp,

    TransactionType: "CustomerPayBillOnline",

    Amount: Math.round(amount),

    PartyA: normalizedPhone,

    PartyB: mpesaConfig.shortcode,

    PhoneNumber: normalizedPhone,

    CallBackURL: mpesaConfig.callbackURL,

    AccountReference: `BOOKING-${bookingId}`,

    TransactionDesc: "Hussein Mboya Tour Booking",
  };

  try {
    const { data } = await mpesaClient.post(mpesaUrls.stk, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.errorMessage ||
        error.response?.data?.errorCode ||
        "Failed to initiate STK Push.",
    );
  }
};
