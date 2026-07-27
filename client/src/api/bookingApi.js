import api from "./axios";



/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

export const createBooking =
async(data)=>{


const token =
localStorage.getItem("token");



const response =
await api.post(

"/bookings",

data,

{

headers:{

Authorization:
`Bearer ${token}`

}

}

);



return response.data;


};









/*
|--------------------------------------------------------------------------
| GET LOGGED-IN USER BOOKINGS
|--------------------------------------------------------------------------
*/

export const getMyBookings =
async()=>{


const token =
localStorage.getItem("token");



const response =
await api.get(

"/bookings/my-bookings",

{

headers:{

Authorization:
`Bearer ${token}`

}

}

);



return response.data;


};









/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

export const getBooking =
async(id)=>{


const token =
localStorage.getItem("token");



const response =
await api.get(

`/bookings/${id}`,

{

headers:{

Authorization:
`Bearer ${token}`

}

}

);



return response.data;


};









/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/

export const cancelBooking =
async(id)=>{


const token =
localStorage.getItem("token");



const response =
await api.put(

`/bookings/cancel/${id}`,

{},

{

headers:{

Authorization:
`Bearer ${token}`

}

}

);



return response.data;


};