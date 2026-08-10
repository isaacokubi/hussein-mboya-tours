import {
    Navigate,
    Outlet
}
from "react-router-dom";


import {
    useAuth
}
from "../../context/AuthContext";







export default function AgentRoute(){



const {
    user,
    token
}
=
useAuth();







if(
    !token ||
    !user
){


return (

<Navigate

to="/agent/login"

replace

/>

);


}








const roleName =

user.role?.name ||
user.role ||
user.legacyRole ||
user.roleId?.name ||
"";

const normalizedRole = String(roleName)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");








if(
    normalizedRole !== "agent"
){


return (

<Navigate

to="/"

replace

/>

);


}







return <Outlet/>;


}