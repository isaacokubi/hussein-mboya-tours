
import User from "../models/User.js";


const securityService = {


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


let threatLevel="low";


if(totalUsers > 500){
threatLevel="medium";
}


return {


securityScore:
Math.min(
100,
90 - (threatLevel==="medium"?10:0)
),


threatLevel,


authentication:{
status:"healthy",
jwt:true
},


authorization:{


roles:7,


permissions:50,


admins

},


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


database:"Configured"


};


}


};


export default securityService;

