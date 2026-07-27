import {
Outlet
}
from "react-router-dom";


import AgentSidebar from "../components/agent/AgentSidebar";

import AgentHeader from "../components/agent/AgentHeader";



export default function AgentLayout(){


return (

<div
className="
flex
bg-gray-100
min-h-screen
"
>


<AgentSidebar/>


<div
className="
flex-1
"
>


<AgentHeader/>


<main
className="
p-6
"
>

<Outlet/>


</main>


</div>


</div>


)

}