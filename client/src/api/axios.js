
import axios from "axios";


const api = axios.create({

baseURL:
import.meta.env.VITE_API_URL ||
"http://localhost:5000/api",

withCredentials:true,

timeout:30000,

headers:{
"Content-Type":"application/json"
}

});




api.interceptors.request.use(

(config)=>{


const token =
localStorage.getItem("token") ||
localStorage.getItem("accessToken") ||
localStorage.getItem("authToken");



if(token){

config.headers.Authorization =
`Bearer ${token}`;

}



return config;


},


(error)=>
Promise.reject(error)

);






api.interceptors.response.use(

(response)=>response,


(error)=>{


if(error.response?.status===401){


console.error(
"401 SERVER RESPONSE",
error.response.data
);


// DO NOT REMOVE TOKEN HERE


}



return Promise.reject(error);


}

);



export default api;

