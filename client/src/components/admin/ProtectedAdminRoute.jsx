import {
    Navigate,
    Outlet
} from "react-router-dom";





export default function ProtectedAdminRoute({

    permission

}) {





let user = null;



try {


user = JSON.parse(

localStorage.getItem("user")

);



}

catch {


localStorage.removeItem("user");


}






const token = localStorage.getItem("token");






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









/*
|--------------------------------------------------------------------------
| ROLE CHECK
|--------------------------------------------------------------------------
*/


const roleName =

user.role?.name || user.role;







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

to="/admin/login"

replace

/>

);


}










/*
|--------------------------------------------------------------------------
| PERMISSION CHECK
|--------------------------------------------------------------------------
*/



if(permission){



const permissions =

JSON.parse(

localStorage.getItem("permissions")

) || [];





if(
    !permissions.includes(permission)
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
