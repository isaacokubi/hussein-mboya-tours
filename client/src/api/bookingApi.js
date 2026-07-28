// client/src/api/bookingApi.js


import axios from "axios";



const API = axios.create({


    baseURL:

    import.meta.env.VITE_API_URL ||

    "http://localhost:5000/api",


});









/*
|--------------------------------------------------------------------------
| ATTACH TOKEN AUTOMATICALLY
|--------------------------------------------------------------------------
*/


API.interceptors.request.use(


(config)=>{


const token =

localStorage.getItem("token");



console.log(

"BOOKING API TOKEN:",

token

);





if(token){


config.headers.Authorization =

`Bearer ${token}`;


}




return config;



},



(error)=>{


return Promise.reject(error);


}


);









/*
|--------------------------------------------------------------------------
| GET MY BOOKINGS
|--------------------------------------------------------------------------
|
| Customer bookings
|
*/


export const getMyBookings = async()=>{


const response =

await API.get(

"/bookings/my-bookings"

);



return response.data;


};









/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
|
| Customer creates booking
|
*/


export const createBooking = async(data)=>{


const response =

await API.post(

"/bookings",

data

);



return response.data;


};









/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/


export const getBooking = async(id)=>{


const response =

await API.get(

`/bookings/${id}`

);



return response.data;


};









/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/


export const cancelBooking = async(id)=>{


const response =

await API.put(

`/bookings/cancel/${id}`,

{}

);



return response.data;


};









/*
|--------------------------------------------------------------------------
| ADMIN GET ALL BOOKINGS
|--------------------------------------------------------------------------
|
| GET /api/bookings/admin
|
| Supports:
| - status filter
| - paymentStatus filter
| - search
|
| Example:
|
| getAdminBookings({
|   status:"confirmed",
|   paymentStatus:"paid"
| })
|
|--------------------------------------------------------------------------
*/


export const getAdminBookings = async(params)=>{


const response =

await API.get(

"/bookings/admin",

{

params

}

);



return response.data;


};









/*
|--------------------------------------------------------------------------
| ADMIN UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
|
| PUT /api/bookings/:id/status
|
|--------------------------------------------------------------------------
*/


export const updateBookingStatus = async(

id,

status

)=>{


const response =

await API.put(

`/bookings/${id}/status`,

{

status

}

);



return response.data;


};









export default API;