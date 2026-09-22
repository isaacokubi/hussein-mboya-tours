import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
dotenv.config({path:path.resolve(__dirname,"../.env")});
dotenv.config({path:path.resolve(__dirname,"../../.env")});
const nodeEnv=process.env.NODE_ENV||"development";
const isProduction=nodeEnv==="production";
const truthy=v=>String(v||"").toLowerCase()==="true";
const hasStrongSecret=v=>{const s=String(v||"");return s.length>=32&&/[a-z]/.test(s)&&/[A-Z]/.test(s)&&/\d/.test(s);};
if(isProduction){
 if(!hasStrongSecret(process.env.JWT_SECRET)) throw new Error("Production JWT_SECRET must be at least 32 characters and contain upper-case, lower-case and numeric characters.");
 for(const key of ["ALLOW_SINGLE_TENANT_DEV_FALLBACK","ALLOW_GLOBAL_MPESA_FALLBACK","MFA_DEV_MODE"]) if(truthy(process.env[key])) throw new Error(`${key}=true is forbidden in production.`);
 const origins=String(process.env.CLIENT_ORIGINS||process.env.CLIENT_URL||"").split(",").map(v=>v.trim()).filter(Boolean);
 if(!origins.length||origins.some(o=>!/^https:\/\//i.test(o))) throw new Error("Production CLIENT_ORIGINS/CLIENT_URL must contain only HTTPS origins.");
}
const env={
 PORT:process.env.PORT||5000,
 NODE_ENV:nodeEnv,
 FIREBASE_PROJECT_ID:process.env.FIREBASE_PROJECT_ID,
 FIREBASE_CLIENT_EMAIL:process.env.FIREBASE_CLIENT_EMAIL,
 FIREBASE_PRIVATE_KEY:process.env.FIREBASE_PRIVATE_KEY,
 FIREBASE_SERVICE_ACCOUNT_JSON:process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
 FIREBASE_SERVICE_ACCOUNT_PATH:process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
 FIREBASE_STORAGE_BUCKET:process.env.FIREBASE_STORAGE_BUCKET,
 JWT_SECRET:process.env.JWT_SECRET,
 JWT_EXPIRE:process.env.JWT_EXPIRE||process.env.JWT_EXPIRES_IN||"7d",
 CLIENT_ORIGINS:process.env.CLIENT_ORIGINS||process.env.CLIENT_URL||"http://localhost:5173",
 CLIENT_URL:process.env.CLIENT_URL,
 OPENAI_API_KEY:process.env.OPENAI_API_KEY,
 AI_MODEL:process.env.AI_MODEL||"gpt-4.1-mini"
};
if(!env.FIREBASE_PROJECT_ID&&!env.FIREBASE_SERVICE_ACCOUNT_JSON&&!env.FIREBASE_SERVICE_ACCOUNT_PATH&&!(env.FIREBASE_CLIENT_EMAIL&&env.FIREBASE_PRIVATE_KEY)){
 if(!process.env.GOOGLE_APPLICATION_CREDENTIALS) console.warn("Firebase credentials are not configured; set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_* environment variables.");
}
if(!env.JWT_SECRET) throw new Error("Missing required environment variable: JWT_SECRET");
export default env;
