import api from "./axios";


export const getSuperAdminDashboard = async()=>{

const {data}=await api.get(
"/superadmin/dashboard"
);

return data;

};
