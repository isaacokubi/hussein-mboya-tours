import {
    useNavigate
} from "react-router-dom";


import {
    useAuth
} from "../../context/AuthContext";




export default function AgentHeader(){



const navigate = useNavigate();



const {
    user
}
=
useAuth();








const logout = ()=>{


localStorage.removeItem("token");

localStorage.removeItem("user");

localStorage.removeItem("permissions");



navigate("/agent/login");


};








return (

<header

className="
h-16
bg-white
shadow
flex
items-center
justify-between
px-6
"

>






{/* LEFT */}

<div>


<h1

className="
font-bold
text-xl
text-gray-800
"

>

Agent Portal

</h1>



</div>








{/* RIGHT */}

<div

className="
flex
items-center
gap-4
"

>







<div

className="
text-right
"

>


<p

className="
font-semibold
"

>

{
user?.name || "Agent"
}

</p>




<p

className="
text-sm
text-gray-500
"

>

{
user?.role?.name || "Agent"
}

</p>



</div>







<div

className="
w-10
h-10
rounded-full
bg-green-700
text-white
flex
items-center
justify-center
font-bold
"

>

{

user?.name

?

user.name
.charAt(0)
.toUpperCase()

:

"A"

}


</div>








<button

onClick={logout}

className="
bg-red-600
text-white
px-4
py-2
rounded-lg
hover:bg-red-700
"

>

Logout

</button>






</div>





</header>


);


}
