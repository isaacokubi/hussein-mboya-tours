// server/config/mpesa.js

import dotenv from "dotenv";

dotenv.config();

/*
|--------------------------------------------------------------------------
| LEGACY / PLATFORM-LEVEL MPESA CONFIGURATION
|--------------------------------------------------------------------------
|
| Tenant gateway credentials are now the primary configuration source.
| These environment variables are optional and are retained only for
| backward compatibility and controlled single-tenant deployments.
|--------------------------------------------------------------------------
*/

export const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || "",
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
  shortcode: process.env.MPESA_SHORTCODE || "",
  passkey: process.env.MPESA_PASSKEY || "",
  callbackUrl: process.env.MPESA_CALLBACK_URL || "",
  initiatorName: process.env.MPESA_INITIATOR_NAME || "",
  securityCredential: process.env.MPESA_SECURITY_CREDENTIAL || "",
  environment: process.env.MPESA_ENVIRONMENT || "sandbox",
};

export const hasLegacyMpesaConfig = () => Boolean(
  mpesaConfig.consumerKey &&
  mpesaConfig.consumerSecret &&
  mpesaConfig.shortcode &&
  mpesaConfig.passkey
);

/*
|--------------------------------------------------------------------------
| MPESA API URLS
|--------------------------------------------------------------------------
*/

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

export const getMpesaUrls = () => (
  mpesaConfig.environment === "production"
    ? mpesaUrls.production
    : mpesaUrls.sandbox
);
