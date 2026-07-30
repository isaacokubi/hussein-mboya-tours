import {
Navigate
}
from "react-router-dom";


export default function PermissionGuard({

permission,

children

}){


const user =
JSON.parse(
localStorage.getItem("user")
);



const allowed =
user?.permissions?.some(
item=>item.name===permission
);



if(!allowed){

return <Navigate to="/unauthorized"/>

}



return children;


}