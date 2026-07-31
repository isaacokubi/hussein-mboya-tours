import dotenv from "dotenv";

dotenv.config();

/*
|--------------------------------------------------------------------------
| VALIDATE REQUIRED MPESA CONFIGURATION
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| MPESA CONFIGURATION
|--------------------------------------------------------------------------
*/

export const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,

  consumerSecret: process.env.MPESA_CONSUMER_SECRET,

  shortcode: process.env.MPESA_SHORTCODE,

  passkey: process.env.MPESA_PASSKEY,

  callbackUrl: process.env.MPESA_CALLBACK_URL,

  environment: process.env.MPESA_ENVIRONMENT || "sandbox",
};

/*
|--------------------------------------------------------------------------
| MPESA API URLS
|--------------------------------------------------------------------------
*/

export const mpesaUrls = {
  sandbox: {
    auth:
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",

    stkPush:
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",

    query:
      "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
  },

  production: {
    auth:
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",

    stkPush:
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",

    query:
      "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query",
  },
};

/*
|--------------------------------------------------------------------------
| GET ACTIVE MPESA URLS
|--------------------------------------------------------------------------
*/

export const getMpesaUrls = () =>
  mpesaConfig.environment === "production"
    ? mpesaUrls.production
    : mpesaUrls.sandbox;