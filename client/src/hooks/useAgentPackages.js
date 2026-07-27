import {
useQuery
}
from "@tanstack/react-query";


import {
getPackages
}
from "../api/packageApi";



export default function useAgentPackages(params){


return useQuery({

queryKey:[
"agent-packages",
params
],


queryFn:

async()=>{


const res =
await getPackages(params);


return res.data.packages;


}


});


}