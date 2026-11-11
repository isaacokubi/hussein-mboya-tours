/**
 * Purpose: Agent Header reusable UI component. Main declarations: AgentHeader, handleLogout.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import {
    useNavigate
} from "react-router-dom";


// Load ../../context/AuthContext so this module can use its exported dependencies.
import {
    useAuth
} from "../../context/AuthContext";




// Define AgentHeader; its parameters and body implement this operation.
export default function AgentHeader(){



// Declare navigate for use by the surrounding module or function.
const navigate = useNavigate();



// Declare { user, logout } for use by the surrounding module or function.
const { user, logout } = useAuth();








// Declare handleLogout for use by the surrounding module or function.
const handleLogout = async () => { await logout(); navigate("/agent/login"); };






// Return the expression shown below to the caller.
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

onClick={handleLogout}

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
