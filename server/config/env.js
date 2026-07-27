import dotenv from "dotenv";

dotenv.config();


const env = {

  PORT:
    process.env.PORT || 5000,


  NODE_ENV:
    process.env.NODE_ENV || "development",


  MONGODB_URI:
    process.env.MONGODB_URI,


  JWT_SECRET:
    process.env.JWT_SECRET,


  JWT_EXPIRE:
    process.env.JWT_EXPIRE || "7d",


  CLIENT_URL:
    process.env.CLIENT_URL,


  // AI CONFIGURATION

  OPENAI_API_KEY:
    process.env.OPENAI_API_KEY,


  AI_MODEL:
    process.env.AI_MODEL || "gpt-4.1-mini",

};


export default env;