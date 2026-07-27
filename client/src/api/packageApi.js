import api from "./axios";


export const getPackages =
(params)=>{


return api.get(

"/agent/packages",

{
params
}

);


};



export const getPackageDetails =
(id)=>{


return api.get(

`/agent/packages/${id}`

);


};