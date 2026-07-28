import axios from "axios";



const API = axios.create({


baseURL:

import.meta.env.VITE_API_URL + "/api"


});






// ============================================================
// ATTACH AUTH TOKEN
// ============================================================


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







// ============================================================
// FINANCE DASHBOARD STATISTICS
// ============================================================


export const getFinanceDashboard =

()=>


API.get(

"/finance"

);







// ============================================================
// ALL TRANSACTIONS
// ============================================================


export const getTransactions =

()=>


API.get(

"/finance/transactions"

);








// ============================================================
// MPESA TRANSACTIONS
// ============================================================
//
// Supports:
// - status filtering
// - search
// - receipt lookup
// - customer search
//
// Example:
// getMpesaTransactions({
//   status:"completed",
//   search:"QWE123"
// })
//
// ============================================================


export const getMpesaTransactions =

(params)=>

API.get(

"/finance/transactions",

{

params

}

);







// ============================================================
// FINANCE REPORTS
// ============================================================


export const getReports =

()=>


API.get(

"/finance/reports"

);