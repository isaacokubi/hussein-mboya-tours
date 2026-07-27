import {
useAuth
}
from "../../context/AuthContext";


export default function AgentHeader(){


const {
user
}=useAuth();



return (

<header
className="
h-16
bg-white
shadow
flex
justify-between
items-center
px-6
"
>


<div>

<h1
className="
font-semibold
"
>

Agent Portal

</h1>


</div>



<div>

Welcome,

{" "}

<span
className="
font-bold
"
>

{user?.name}

</span>


</div>


</header>

)

}