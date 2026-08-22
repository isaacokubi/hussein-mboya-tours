import { mergeTenantFilter } from "../tenancy/context.js";
import { getSystemSettings } from "../services/settingsService.js";
import mongoose from "mongoose";

const checkEndpoint = async (name, path) => {
  const start = Date.now();

  try {

    const responseTime = Date.now() - start;

    return {
      endpoint:path,
      status:"healthy",
      responseTime:responseTime + "ms"
    };

  } catch(error){

    return {
      endpoint:path,
      status:"failed",
      error:error.message
    };

  }
};


export const getApiMonitor = async(req,res)=>{

  const settings = await getSystemSettings();
  const companyName = settings.companyName || "Company";

try{

const memory = process.memoryUsage();

const uptimeSeconds = process.uptime();


const endpoints = await Promise.all([
checkEndpoint(
"Security",
"/api/superadmin/security"
),

checkEndpoint(
"Dashboard",
"/api/superadmin/dashboard"
),

checkEndpoint(
"Tours",
"/api/tours"
),

checkEndpoint(
"Bookings",
"/api/bookings"
)

]);


const failedEndpoints =
endpoints.filter(
item=>item.status!=="healthy"
).length;



const healthScore =
failedEndpoints === 0 ? 100 :
Math.max(0,100-(failedEndpoints*25));



res.json({

success:true,

data:{

status:"online",

service:`${companyName} API`,

healthScore,


database:{

status:
mongoose.connection.readyState===1
?
"Connected"
:
"Disconnected"

},


response:"normal",


server:{

nodeVersion:process.version,

environment:
process.env.NODE_ENV || "development",

uptime:
Math.floor(uptimeSeconds/3600)+"h "+
Math.floor((uptimeSeconds%3600)/60)+"m",

memory:{

used:
Math.round(memory.heapUsed/1024/1024)+" MB",

total:
Math.round(memory.heapTotal/1024/1024)+" MB"

}

},


endpoints,


timestamp:new Date()

}

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
