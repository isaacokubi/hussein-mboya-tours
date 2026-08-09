import {
  useState,
  useContext
} from "react";


import {
  useNavigate
}
from "react-router-dom";


import {
  toast
}
from "react-toastify";


import {
  AuthContext
}
from "../context/AuthContext";






export default function Register(){



const navigate =
useNavigate();




const {
register
}
=
useContext(AuthContext);






const [formData,setFormData] =
useState({

name:"",

email:"",

phone:"",

password:"",

confirmPassword:""


});





const [
loading,
setLoading
]
=
useState(false);









const handleChange=(e)=>{


setFormData({

...formData,

[e.target.name]:
e.target.value


});


};









const handleSubmit=async(e)=>{


e.preventDefault();






if(
formData.password !==
formData.confirmPassword
){


toast.error(
"Passwords do not match"
);


return;


}






try{


setLoading(true);





const response =
await register({

name:
formData.name,


email:
formData.email,


phone:
formData.phone,


password:
formData.password


});






toast.success(
"Account created successfully"
);









const user =
response?.user;





const role =

typeof user?.role === "string"

?

user.role.toLowerCase()

:

user?.role?.name?.toLowerCase();









switch(role){


case "admin":
case "superadmin":
case "super_admin":
case "administrator":

navigate("/admin");

break;




case "agent":

navigate("/agent");

break;




case "tourguide":
case "tour_guide":

navigate("/guide/dashboard");

break;




case "tourmanager":
case "tour_manager":
case "manager":

navigate("/tour-manager/dashboard");

break;




default:

navigate("/dashboard");

break;


}








}

catch(error){



console.error(
"REGISTER ERROR:",
error
);




toast.error(

error?.response?.data?.message ||

"Registration failed"

);



}


finally{


setLoading(false);


}



};










return (

<div className="
min-h-screen
flex
items-center
justify-center
bg-gray-100
p-6
">





<div className="
bg-white
shadow-xl
rounded-2xl
p-8
w-full
max-w-md
">






<h1 className="
text-3xl
font-bold
text-center
mb-6
text-green-800
">

Join Coherent Tours

</h1>






<p className="
text-center
text-gray-500
mb-6
">

Create your traveller account

</p>








<form

onSubmit={handleSubmit}

className="
space-y-4
"

>







<input

type="text"

name="name"

placeholder="Full name"

value={
formData.name
}

onChange={handleChange}

required

className="
w-full
border
rounded-lg
p-3
"

/>









<input

type="email"

name="email"

placeholder="Email address"

value={
formData.email
}

onChange={handleChange}

required

className="
w-full
border
rounded-lg
p-3
"

/>









<input

type="tel"

name="phone"

placeholder="Phone number"

value={
formData.phone
}

onChange={handleChange}

required

className="
w-full
border
rounded-lg
p-3
"

/>









<input

type="password"

name="password"

placeholder="Password"

value={
formData.password
}

onChange={handleChange}

required

className="
w-full
border
rounded-lg
p-3
"

/>









<input

type="password"

name="confirmPassword"

placeholder="Confirm password"

value={
formData.confirmPassword
}

onChange={handleChange}

required

className="
w-full
border
rounded-lg
p-3
"

/>









<button

disabled={loading}

className="
w-full
bg-green-700
hover:bg-green-800
text-white
py-3
rounded-xl
font-bold
disabled:opacity-50
"

>

{

loading

?

"Creating Account..."

:

"Register"

}


</button>






</form>









<p className="
text-center
mt-6
text-gray-600
">


Already have an account?



<button

onClick={()=>navigate("/login")}

className="
text-green-700
font-bold
ml-2
"

>

Login

</button>


</p>








</div>





</div>


);


}