import {
    useNavigate
} from "react-router-dom";


import {
    useState
} from "react";



export default function AdminHeader(){


const navigate = useNavigate();



const [user] = useState(()=>{


try{

return JSON.parse(
    localStorage.getItem("user")
) || {};

}

catch(error){

return {};

}


});





const logout = ()=>{


localStorage.removeItem("token");

localStorage.removeItem("user");

localStorage.removeItem("permissions");



navigate("/admin/login");


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
text-xl
font-bold
text-gray-800
"
>

Admin Dashboard

</h1>


</div>







{/* RIGHT */}


<div
className="
flex
items-center
gap-5
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
text-gray-800
"
>

{
user.name || "Administrator"
}

</p>



<p
className="
text-sm
text-gray-500
"
>

{
user.role?.name || "Admin"
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

user.name

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
transition
"

>

Logout

</button>





</div>






</header>


);


}