import {
    Navigate,
    Outlet
}
from "react-router-dom";


import {
    useAuth
}
from "../../context/AuthContext";





export default function AdminRoute({

    children,
    permission

}){



const {
    user,
    token,
    loading

}
=
useAuth();







if(loading){

return (

<div className="min-h-screen flex items-center justify-center">

Loading...

</div>

);

}



if(
    !token ||
    !user
){

return (

<Navigate

to="/login"

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









const allowedRoles = new Set([
    "admin",
    "superadmin",
    
]);







if (!allowedRoles.has(normalizedRole)) {

return (

<Navigate

to="/"

replace

/>

);

}








if(permission){



const permissions =

user.permissions ||

JSON.parse(

localStorage.getItem("permissions")

) ||

[];






const permissionNames = permissions.map(

(item)=>

typeof item === "string"

?

item

:

item.name

);








if(
!permissionNames.includes(permission)

){


return (

<Navigate

to="/admin/unauthorized"

replace

/>

);


}



}








return children || <Outlet/>;


}