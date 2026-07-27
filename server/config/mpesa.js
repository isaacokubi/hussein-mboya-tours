import dotenv from "dotenv";

dotenv.config();


const mpesaConfig = () => {

  return {

    // SANDBOX ENVIRONMENT
    baseURL:
      "https://sandbox.safaricom.co.ke",


    consumerKey:
      process.env.MPESA_CONSUMER_KEY,


    consumerSecret:
      process.env.MPESA_CONSUMER_SECRET,


    // Sandbox shortcode
    shortcode:
      process.env.MPESA_SHORTCODE || "174379",


    passkey:
      process.env.MPESA_PASSKEY,


    callbackURL:
      process.env.MPESA_CALLBACK_URL,


  };

};


export default mpesaConfig;