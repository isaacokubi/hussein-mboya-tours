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
}=useAuth();



if(!user){

return (

<Navigate
to="/login"
/>

)

}



if(user.role !== "Agent"){

return (

<Navigate
to="/"
/>

)

}



return children;


}