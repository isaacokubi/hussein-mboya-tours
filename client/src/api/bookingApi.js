import axios from "axios";


/*
|--------------------------------------------------------------------------
| AXIOS INSTANCE
|--------------------------------------------------------------------------
*/

const API = axios.create({

    baseURL: import.meta.env.VITE_API_URL,

});



/*
|--------------------------------------------------------------------------
| AUTH INTERCEPTOR
|--------------------------------------------------------------------------
*/

API.interceptors.request.use(

    (config)=>{


        const token =
        localStorage.getItem("token");


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
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

export const createBooking =
async(data)=>{


    const response =
    await API.post(

        "/api/bookings",

        data

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


    const response =
    await API.get(

        "/api/bookings/my-bookings"

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


    const response =
    await API.get(

        `/api/bookings/${id}`

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


    const response =
    await API.put(

        `/api/bookings/cancel/${id}`,

        {}

    );


    return response.data;


};




export default API;