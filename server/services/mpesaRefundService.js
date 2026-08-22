
import axios from "axios";


const getAccessToken = async()=>{

const consumerKey =
process.env.MPESA_CONSUMER_KEY;

const consumerSecret =
process.env.MPESA_CONSUMER_SECRET;


const auth =
Buffer
.from(
`${consumerKey}:${consumerSecret}`
)
.toString("base64");


const response =
await axios.get(
"https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
{
headers:{
Authorization:`Basic ${auth}`
}
}
);


return response.data.access_token;

};



export const requestMpesaRefund = async({
amount,
phone,
transactionId
})=>{


const token =
await getAccessToken();


const response =
await axios.post(

"https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",

{

InitiatorName:
process.env.MPESA_INITIATOR_NAME,


SecurityCredential:
process.env.MPESA_SECURITY_CREDENTIAL,


CommandID:
"BusinessPayment",


Amount:
amount,


PartyA:
process.env.MPESA_SHORTCODE,


PartyB:
phone,


Remarks:
`Refund ${transactionId}`,


QueueTimeOutURL:
`${process.env.MPESA_CALLBACK_URL}/refund/timeout`,


ResultURL:
`${process.env.MPESA_CALLBACK_URL}/refund/result`


},

{

headers:{
Authorization:`Bearer ${token}`
}

}

);


return response.data;


};

