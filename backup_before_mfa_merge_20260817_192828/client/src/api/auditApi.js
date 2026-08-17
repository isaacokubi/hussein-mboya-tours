
import api from "./axios";


export const getAuditLogs = async(params={})=>{

const response = await api.get(
"/superadmin/audit",
{
params
}
);

return response.data;

};
