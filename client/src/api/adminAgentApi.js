import axios from "./axios";

export const getAgents = async()=>{

const res = await axios.get("/admin/agents");

return res.data.data;

};
