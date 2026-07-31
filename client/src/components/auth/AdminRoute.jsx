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

    permission

}){



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

to="/admin/login"

replace

/>

);

}








const roleName =

user.role?.name ||

user.role;









const allowedRoles = [

"admin",

"Admin",

"Super Admin"

];







if(
    !allowedRoles.includes(roleName)
){

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








return <Outlet/>;


}