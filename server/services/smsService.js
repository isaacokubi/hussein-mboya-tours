import AfricasTalking from "africastalking";


const africastalking =
AfricasTalking({

apiKey:
process.env.AT_API_KEY,


username:
process.env.AT_USERNAME

});



const sms =
africastalking.SMS;



export const sendSMS =
async(
phone,
message
)=>{


await sms.send({

to:[phone],


message

});


};