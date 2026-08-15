import axios from "./axios";


export const getAgents = async()=>{

const res =
await axios.get("/admin/agents");

const data = res.data;

return Array.isArray(data)
  ? data
  : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.agents)
      ? data.agents
      : [];

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
