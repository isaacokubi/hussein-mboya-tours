import mongoose from "mongoose";

const securityService = {

async getSecurityStatus(){

return {

authentication:"healthy",
authorization:"healthy",
database:
mongoose.connection.readyState === 1
? "healthy"
:"warning",

activeSessions:0,
failedLogins:0,
twoFactorEnabled:0,
blockedUsers:0,
threatLevel:"low",
securityScore:92

};

},


async getSecurityEvents(){

return [

{
type:"system",
message:"Security monitoring initialized",
severity:"info",
createdAt:new Date()
}

];

}

};


export default securityService;
