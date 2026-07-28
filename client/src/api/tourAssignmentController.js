import axios from "axios";


const API = axios.create({

baseURL:
import.meta.env.VITE_API_URL + "/api"

});



API.interceptors.request.use(

(config)=>{


const token =
localStorage.getItem("token");


if(token){

config.headers.Authorization =
`Bearer ${token}`;

}


return config;


}

);




// GET TOURS

export const getTours = ()=>


API.get(
"/tours"
);





// GET STAFF

export const getGuides = ()=>


API.get(
"/staff?position=guide"
);




export const getDrivers = ()=>


API.get(
"/staff?position=driver"
);





// GET VEHICLES

export const getVehicles = ()=>


API.get(
"/vehicles"
);





// ASSIGN TOUR

export const assignTour = (

id,

data

)=>


API.put(

`/tours/${id}/assign`,

data

);



export default API;