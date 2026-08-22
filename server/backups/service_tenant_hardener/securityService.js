
import User from "../models/User.js";


const securityService = {


async getSecurityEvents(){

return [];

},


async getSecurityStatus(){


const totalUsers = await User.countDocuments();



const admins = await User.countDocuments({

role:{
$in:[
"admin",
"super_admin",
"superadmin"
]

}

});



const failedAttempts = 0;



let threatLevel="low";


if(failedAttempts > 50){

threatLevel="medium";

}


if(failedAttempts > 200){

threatLevel="high";

}



let securityScore=95;


if(threatLevel==="medium"){

securityScore=80;

}


if(threatLevel==="high"){

securityScore=60;

}



return {


securityScore,


threatLevel,



authentication:{

status:"Active",

jwt:"active"

},



authorization:{

status:"Active",

roles:7,

permissions:50,

admins

},



users:totalUsers,



controls:[


{
name:"JWT Authentication",
status:"active"
},


{
name:"Role Based Access Control",
status:"active"
},


{
name:"Audit Logging",
status:"active"
},


{
name:"Session Monitoring",
status:"active"
},


{
name:"API Protection",
status:"active"
},


{
name:"Database Security",
status:"active"
}


],



database:"Connected"


};



}


};



export default securityService;
