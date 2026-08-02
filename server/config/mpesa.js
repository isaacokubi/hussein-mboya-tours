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

    throw new Error(
      `Missing required MPESA configuration: ${key}`
    );

  }

}



export const mpesaConfig = {

  consumerKey:
    process.env.MPESA_CONSUMER_KEY,

  consumerSecret:
    process.env.MPESA_CONSUMER_SECRET,

  shortcode:
    process.env.MPESA_SHORTCODE,

  passkey:
    process.env.MPESA_PASSKEY,

  callbackURL:
    process.env.MPESA_CALLBACK_URL,

  environment:
    process.env.MPESA_ENVIRONMENT || "sandbox"

};



export const mpesaUrls = {


  sandbox: {

    auth:
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",


    stk:
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",


    query:
    "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query"

  },


  production: {

    auth:
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",


    stk:
    "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",


    query:
    "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"

  }

};



export const getMpesaUrls = () => {

  if (
    mpesaConfig.environment === "production"
  ) {

    return mpesaUrls.production;

  }


  return mpesaUrls.sandbox;

};