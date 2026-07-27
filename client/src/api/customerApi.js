import api from "./axios";



/*
|--------------------------------------------------------------------------
| GET AGENT CUSTOMERS
|--------------------------------------------------------------------------
*/


export const getAgentCustomers = async()=>{


const response = await api.get(

"/agents/customers"

);



return response.data;


};






/*
|--------------------------------------------------------------------------
| GET SINGLE CUSTOMER
|--------------------------------------------------------------------------
*/


export const getAgentCustomer = async(id)=>{


const response = await api.get(

`/agents/customers/${id}`

);



return response.data;


};






/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/


export const createCustomer = async(data)=>{


const response = await api.post(

"/agents/customers",

data

);



return response.data;


};






/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/


export const updateCustomer = async(id,data)=>{


const response = await api.put(

`/agents/customers/${id}`,

data

);



return response.data;


};






/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/


export const deleteCustomer = async(id)=>{


const response = await api.delete(

`/agents/customers/${id}`

);



return response.data;


};






/*
|--------------------------------------------------------------------------
| CUSTOMER STATISTICS
|--------------------------------------------------------------------------
*/


export const getCustomerStats = async()=>{


const response = await api.get(

"/agents/customers/stats"

);



return response.data;


};