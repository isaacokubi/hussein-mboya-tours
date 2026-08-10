import api from "./axios";

import axios from "./axios";


export const getCommissions = async()=>{

const res =
await axios.get(
"/commissions"
);

return res.data.data;

};



export const getAgentCommissions = async(agentId)=>{

const res =
await axios.get(
`/commissions/agent/${agentId}`
);

return res.data.data;

};



/*
 Auto completed API helpers
*/

export const getAll = async()=>{
    const {data}=await api.get("/commissions");
    return data;
};

