import axios from "axios";
import mpesaConfig from "../config/mpesa.js";


const config = mpesaConfig();



/*
|--------------------------------------------------------------------------
| GENERATE MPESA ACCESS TOKEN
|--------------------------------------------------------------------------
*/

export const generateAccessToken = async () => {

  try {

    const auth =
      Buffer
        .from(
          `${config.consumerKey}:${config.consumerSecret}`
        )
        .toString("base64");


    console.log(
      "MPESA CONFIG CHECK:",
      {
        baseURL: config.baseURL,

        consumerKey:
          config.consumerKey
            ? "Loaded"
            : "Missing",

        consumerSecret:
          config.consumerSecret
            ? "Loaded"
            : "Missing",

        shortcode:
          config.shortcode
      }
    );


    const response =
      await axios.get(
        `${config.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers:{
            Authorization:
              `Basic ${auth}`
          }
        }
      );


    return response.data.access_token;


  } catch(error){


    console.log(
      "MPESA TOKEN ERROR:",
      error.response?.data ||
      error.message
    );


    throw error;

  }

};



/*
|--------------------------------------------------------------------------
| GENERATE TIMESTAMP
|--------------------------------------------------------------------------
*/

export const generateTimestamp = () => {

  const date = new Date();


  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth()+1
    )
    .padStart(2,"0");


  const day =
    String(
      date.getDate()
    )
    .padStart(2,"0");


  const hours =
    String(
      date.getHours()
    )
    .padStart(2,"0");


  const minutes =
    String(
      date.getMinutes()
    )
    .padStart(2,"0");


  const seconds =
    String(
      date.getSeconds()
    )
    .padStart(2,"0");


  return (
    `${year}${month}${day}${hours}${minutes}${seconds}`
  );

};



/*
|--------------------------------------------------------------------------
| GENERATE STK PASSWORD
|--------------------------------------------------------------------------
*/

export const generatePassword =
(timestamp)=>{


  return Buffer
    .from(
      `${config.shortcode}${config.passkey}${timestamp}`
    )
    .toString("base64");


};