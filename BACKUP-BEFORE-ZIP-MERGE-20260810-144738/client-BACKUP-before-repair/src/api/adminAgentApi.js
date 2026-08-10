import axios from "./axios";


export const getAgents = async()=>{

const res =
await axios.get("/admin/agents");

return res.data.data;

};



export const getAgentById = async(id)=>{

const res =
await axios.get(
`/admin/agents/${id}`
);

return res.data.data;

};



export const approveAgent = async(id)=>{

const res =
await axios.put(
`/admin/agents/${id}/approve`
);

return res.data;

};



export const updateAgentStatus = async(
id,
status
)=>{

const res =
await axios.put(
`/admin/agents/${id}/status`,
{
status
}
);

return res.data;

};
