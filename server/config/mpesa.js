// server/config/mpesa.js

import dotenv from "dotenv";

dotenv.config();

const required = [
  "MPESA_CONSUMER_KEY",
  "MPESA_CONSUMER_SECRET",
  "MPESA_SHORTCODE",
  "MPESA_PASSKEY",
  "MPESA_CALLBACK_URL",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required MPESA configuration: ${key}`);
  }
}

export const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortcode: process.env.MPESA_SHORTCODE,
  passkey: process.env.MPESA_PASSKEY,
  callbackUrl: process.env.MPESA_CALLBACK_URL,
  environment: process.env.MPESA_ENVIRONMENT || "sandbox",

  // B2C disbursement configuration. These are intentionally optional at startup;
  // they are validated only when an M-Pesa agent withdrawal is actually sent.
  b2cShortcode: process.env.MPESA_B2C_SHORTCODE || process.env.MPESA_SHORTCODE,
  b2cInitiatorName: process.env.MPESA_B2C_INITIATOR_NAME || "",
  b2cInitiatorPassword: process.env.MPESA_B2C_INITIATOR_PASSWORD || "",
  b2cSecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL || "",
  b2cCertificateBase64: process.env.MPESA_B2C_CERTIFICATE_BASE64 || "",
  b2cResultUrl: process.env.MPESA_B2C_RESULT_URL || "",
  b2cTimeoutUrl: process.env.MPESA_B2C_TIMEOUT_URL || "",
  b2cCommandId: process.env.MPESA_B2C_COMMAND_ID || "BusinessPayment",
};

export const mpesaUrls = {
  sandbox: {
    auth: "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    stk: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    query: "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
    b2c: "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
  },
  production: {
    auth: "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    stk: "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    query: "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query",
    b2c: "https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
  },
};

export const getMpesaUrls = () =>
  mpesaConfig.environment === "production" ? mpesaUrls.production : mpesaUrls.sandbox;
