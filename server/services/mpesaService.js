import { mergeTenantFilter } from "../tenancy/context.js";
// server/services/mpesaService.js
import { getSystemSettings } from "../services/settingsService.js";

import axios from "axios";

import {
  mpesaConfig,
  getMpesaUrls,
} from "../config/mpesa.js";


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


  let normalized = phone
    .toString()
    .trim()
    .replace(/\s+/g, "");


  if (normalized.startsWith("+254")) {
    normalized = normalized.substring(1);
  }


  if (/^0[17]\d{8}$/.test(normalized)) {
    normalized =
      "254" + normalized.substring(1);
  }


  // Safaricom uses 07xx and 01xx mobile ranges in Kenya.
  if (!/^254[17]\d{8}$/.test(normalized)) {
    throw new Error(
      "Invalid Safaricom phone number."
    );
  }


  return normalized;

};



/*
|--------------------------------------------------------------------------
| GENERATE ACCESS TOKEN
|--------------------------------------------------------------------------
*/

export const generateAccessToken = async () => {

  const urls = getMpesaUrls();


  const auth = Buffer.from(
    `${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`
  ).toString("base64");


  try {

    const { data } =
      await mpesaClient.get(
        urls.auth,
        {
          headers:{
            Authorization:
              `Basic ${auth}`,
          },
        }
      );


    if (!data.access_token) {

      throw new Error(
        "M-Pesa access token missing."
      );

    }


    return data.access_token;


  } catch(error) {


    console.error("==============================");

    console.error(
      "MPESA AUTH ERROR STATUS:",
      error.response?.status
    );


    console.error(
      "MPESA AUTH ERROR DATA:",
      error.response?.data
    );


    console.error(
      "MPESA AUTH ERROR MESSAGE:",
      error.message
    );


    console.error("==============================");


    throw new Error(
      error.response?.data?.errorMessage ||
      error.response?.data?.error ||
      "Unable to authenticate with M-Pesa."
    );

  }

};




/*
|--------------------------------------------------------------------------
| GENERATE TIMESTAMP
|--------------------------------------------------------------------------
*/

export const generateTimestamp = () => {

  const now = new Date();


  return (
    now.getFullYear() +
    String(now.getMonth() + 1)
      .padStart(2,"0") +
    String(now.getDate())
      .padStart(2,"0") +
    String(now.getHours())
      .padStart(2,"0") +
    String(now.getMinutes())
      .padStart(2,"0") +
    String(now.getSeconds())
      .padStart(2,"0")
  );

};




/*
|--------------------------------------------------------------------------
| GENERATE PASSWORD
|--------------------------------------------------------------------------
*/

export const generatePassword = (
  timestamp
) => {


  return Buffer.from(
    `${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`
  )
  .toString("base64");


};




/*
|--------------------------------------------------------------------------
| INITIATE STK PUSH
|--------------------------------------------------------------------------
*/

export const initiateStkPush = async ({
  phone,
  amount,
  bookingId,
}) => {

  const settings = await getSystemSettings();
  const companyName = settings.companyName || "Company";

  if (!phone) {
    throw new Error(
      "Phone number is required."
    );
  }


  if (!amount || amount <= 0) {
    throw new Error(
      "Invalid payment amount."
    );
  }


  if (!bookingId) {
    throw new Error(
      "Booking ID is required."
    );
  }



  const urls = getMpesaUrls();



  const normalizedPhone =
    normalizePhoneNumber(phone);



  const token =
    await generateAccessToken();



  const timestamp =
    generateTimestamp();



  const password =
    generatePassword(timestamp);




  const payload = {

    BusinessShortCode:
      mpesaConfig.shortcode,


    Password:
      password,


    Timestamp:
      timestamp,


    TransactionType:
      "CustomerPayBillOnline",


    Amount:
      Math.round(amount),


    PartyA:
      normalizedPhone,


    PartyB:
      mpesaConfig.shortcode,


    PhoneNumber:
      normalizedPhone,


    CallBackURL:
      mpesaConfig.callbackUrl,


    AccountReference:
      `BOOKING-${bookingId}`,


    TransactionDesc:
      `${companyName} Booking Payment`,

  };



  console.log(
    "MPESA STK PAYLOAD:",
    payload
  );



  try {


    const { data } =
      await mpesaClient.post(

        urls.stk,

        payload,

        {
          headers:{
            Authorization:
              `Bearer ${token}`,
          },
        }

      );



    console.log(
      "MPESA STK RESPONSE:",
      data
    );



    return data;



  } catch(error) {


    console.error(
      "MPESA STK ERROR:",
      error.response?.data ||
      error.message
    );


    throw new Error(
      error.response?.data?.errorMessage ||
      error.response?.data?.errorCode ||
      "STK Push failed."
    );


  }


};