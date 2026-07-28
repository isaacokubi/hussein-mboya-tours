import axios from "axios";


const API = axios.create({

baseURL:
import.meta.env.VITE_API_URL

});



API.interceptors.request.use(
(config)=>{


const token =
localStorage.getItem("token");


config.headers.Authorization =
`Bearer ${token}`;


return config;


}

);





export const getBookings =
async()=>{


const {data} =
await API.get(
"/api/admin/bookings"
);


return data;


};





export const updateBooking =
async(id,status)=>{


const {data} =
await API.put(

`/api/admin/bookings/${id}`,

{
status
}

);


return data;


};