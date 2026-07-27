import {
Navigate
}
from "react-router-dom";


import {
useAuth
}
from "../../context/AuthContext";


export default function AgentRoute({
children
}){


const {
user
}
=
useAuth();



if(
!user ||
user.role !== "travel_agent"
){

return (

<Navigate
to="/"
replace

/>

);

}



return children;

}