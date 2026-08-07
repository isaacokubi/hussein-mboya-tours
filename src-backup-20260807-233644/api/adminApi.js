import api from "./axios";



export const getDashboard = async()=>{


const response = await api.get(
    "/admin/dashboard"
);



return response.data;


};




export const getUsersAnalytics = async()=>{


const response =
await api.get(
"/admin/users/analytics"
);


return response.data;


};




export const getBookingAnalytics = async()=>{


const response =
await api.get(
"/admin/bookings/analytics"
);


return response.data;


};




export const getRevenueAnalytics = async()=>{


const response =
await api.get(
"/admin/revenue/analytics"
);


return response.data;


};




export const getSystemHealth = async()=>{


const response =
await api.get(
"/admin/system-health"
);


return response.data;


};