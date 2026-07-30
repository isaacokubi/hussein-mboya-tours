import axios from "axios";


import {

    mpesaConfig,

    mpesaUrls

}

from "../config/mpesa.js";








/*
|--------------------------------------------------------------------------
| GENERATE ACCESS TOKEN
|--------------------------------------------------------------------------
*/


export const generateAccessToken = async()=>{


try{


const auth =

Buffer.from(

`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`

)

.toString("base64");






console.log(

"MPESA CONFIG CHECK:",

{

consumerKey:

mpesaConfig.consumerKey

?

"Loaded"

:

"Missing",



consumerSecret:

mpesaConfig.consumerSecret

?

"Loaded"

:

"Missing",



shortcode:

mpesaConfig.shortcode,


callbackURL:

mpesaConfig.callbackURL

}

);







const response =

await axios.get(

mpesaUrls.oauth,

{

headers:{

Authorization:

`Basic ${auth}`

}

}

);






return response.data.access_token;



}

catch(error){


console.log(

"MPESA TOKEN ERROR:",

error.response?.data ||

error.message

);



throw error;


}


};









/*
|--------------------------------------------------------------------------
| GENERATE TIMESTAMP
|--------------------------------------------------------------------------
*/


export const generateTimestamp = ()=>{


const date = new Date();



const year =

date.getFullYear();



const month =

String(

date.getMonth()+1

)

.padStart(2,"0");



const day =

String(

date.getDate()

)

.padStart(2,"0");



const hours =

String(

date.getHours()

)

.padStart(2,"0");



const minutes =

String(

date.getMinutes()

)

.padStart(2,"0");



const seconds =

String(

date.getSeconds()

)

.padStart(2,"0");






return (

`${year}${month}${day}${hours}${minutes}${seconds}`

);


};









/*
|--------------------------------------------------------------------------
| GENERATE MPESA PASSWORD
|--------------------------------------------------------------------------
*/


export const generatePassword = (

timestamp

)=>{


return Buffer.from(

`${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`

)

.toString("base64");


};









/*
|--------------------------------------------------------------------------
| STK PUSH
|--------------------------------------------------------------------------
*/


export const stkPush = async(data)=>{


try{


const token =

await generateAccessToken();







const timestamp =

generateTimestamp();







const password =

generatePassword(

timestamp

);








const payload = {


BusinessShortCode:

mpesaConfig.shortcode,



Password:

password,



Timestamp:

timestamp,



TransactionType:

"CustomerPayBillOnline",




Amount:

Math.round(

data.amount

),




PartyA:

data.phone,



PartyB:

mpesaConfig.shortcode,



PhoneNumber:

data.phone,



CallBackURL:

mpesaConfig.callbackURL,



AccountReference:

`BOOKING-${data.bookingId}`,



TransactionDesc:

"Hussein Mboya Tour Booking"


};







console.log(

"MPESA STK PAYLOAD:",

{

phone:data.phone,

amount:data.amount,

bookingId:data.bookingId,

shortcode:mpesaConfig.shortcode

}

);








const response =

await axios.post(

mpesaUrls.stk,

payload,

{

headers:{

Authorization:

`Bearer ${token}`

}

}

);







return response.data;



}

catch(error){


console.log(

"MPESA STK ERROR:",

error.response?.data ||

error.message

);



throw error;


}


};