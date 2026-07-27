import {
useQuery
}
from "@tanstack/react-query";


import {
getAgentCustomers
}
from "../api/customerApi";



export default function useAgentCustomers(){


return useQuery({

queryKey:[
"agent-customers"
],


queryFn:

async()=>{


const res =
await getAgentCustomers();


return res.data.customers;


}


});


}