import mongoose from "mongoose";



export const getSystemHealth = async(req,res)=>{

try{


const memory =
process.memoryUsage();



const dbStatus =
mongoose.connection.readyState === 1
? "connected"
: "disconnected";



res.json({

success:true,


system:{


server:"online",


database:dbStatus,


uptime:
Math.floor(process.uptime())+" seconds",



nodeVersion:
process.version,



memory:{


rss:
Math.round(
memory.rss / 1024 / 1024
)+" MB",


heapUsed:
Math.round(
memory.heapUsed / 1024 / 1024
)+" MB"


}



}


});



}catch(error){


res.status(500).json({

success:false,

message:error.message

});


}

};
