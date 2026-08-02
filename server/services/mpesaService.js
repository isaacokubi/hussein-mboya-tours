import axios from "axios";

import { mpesaConfig, getMpesaUrls } from "../config/mpesa.js";

const mpesaClient = axios.create({
  timeout: 30000,
});

/*
|--------------------------------------------------------------------------
| PHONE NORMALIZATION
|--------------------------------------------------------------------------
*/

export const normalizePhoneNumber = (phone) => {
  if (!phone) {
    throw new Error("Phone number is required");
  }

  let value = phone.toString().replace(/\s+/g, "").trim();

  if (value.startsWith("+254")) {
    value = value.substring(1);
  }

  if (value.startsWith("07")) {
    value = "254" + value.substring(1);
  }

  if (!/^2547\d{8}$/.test(value)) {
    throw new Error("Invalid Safaricom number");
  }

  return value;
};

/*
|--------------------------------------------------------------------------
| ACCESS TOKEN
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| ACCESS TOKEN
|--------------------------------------------------------------------------
*/

export const generateAccessToken = async () => {
  const urls = getMpesaUrls();

  const credentials = Buffer.from(
    `${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`,
  ).toString("base64");

  try {
    const response = await mpesaClient.get(urls.auth, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error("==============================");

    console.error("MPESA AUTH ERROR STATUS:", error.response?.status);

    console.error("MPESA AUTH ERROR DATA:", error.response?.data);

    console.error("MPESA AUTH ERROR MESSAGE:", error.message);

    console.error("==============================");

    throw new Error(
      error.response?.data?.errorMessage ||
        error.response?.data?.error ||
        error.message ||
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
  const date = new Date();

  return (
    date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0") +
    String(date.getHours()).padStart(2, "0") +
    String(date.getMinutes()).padStart(2, "0") +
    String(date.getSeconds()).padStart(2, "0")
  );
};

/*
|--------------------------------------------------------------------------
| PASSWORD
|--------------------------------------------------------------------------
*/

export const generatePassword = (timestamp) => {
  return Buffer.from(
    `${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`,
  ).toString("base64");
};

/*
|--------------------------------------------------------------------------
| STK PUSH
|--------------------------------------------------------------------------
*/

export const initiateStkPush = async ({ phone, amount, bookingId }) => {
  const urls = getMpesaUrls();

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

    CallBackURL: mpesaConfig.callbackUrl,

    AccountReference: `BOOKING-${bookingId}`,

    TransactionDesc: "Hussein Mboya Tours Payment",
  };

  try {
    const response = await mpesaClient.post(
      urls.stkPush,

      payload,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.log("STK ERROR:", error.response?.data || error.message);

    throw new Error("STK Push failed");
  }
};
