import axios from "axios";


const API_URL =
import.meta.env.VITE_API_URL ||
"http://localhost:5000";



const api = axios.create({

  baseURL: `${API_URL}/tourmanager`

});



api.interceptors.request.use(

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





// Dashboard
export const getDashboardStats =()=>{

  return api.get("/dashboard");

};





// Tours
export const getTours =()=>{

  return api.get("/tours");

};



export const createTour=(data)=>{

  return api.post(
    "/tours",
    data
  );

};



export const updateTour=(id,data)=>{

  return api.put(
    `/tours/${id}`,
    data
  );

};



export const deleteTour=(id)=>{

  return api.delete(
    `/tours/${id}`
  );

};





// Assign Guide To Tour
export const assignGuide=(data)=>{

  return api.put(
    "/assign-guide",
    data
  );

};





// Itineraries
export const createItinerary=(data)=>{

  return api.post(
    "/itineraries",
    data
  );

};



export const getItineraries=()=>{

  return api.get(
    "/itineraries"
  );

};





// Bookings
export const getBookings =()=>{

  return api.get("/bookings");

};





// Customers
export const getCustomers =()=>{

  return api.get("/customers");

};





// Guides
export const getGuides =()=>{

  return api.get("/guides");

};





// Reports
export const getReports =()=>{

  return api.get("/reports");

};