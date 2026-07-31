import {
  useContext,
  useEffect,
  useState
} from "react";


import {
  AuthContext
} from "../context/AuthContext";


import api from "../api/axios";


import {
  toast
} from "react-toastify";








export default function Profile(){



const {
  user,
  setUser

}
=
useContext(AuthContext);





const [
loading,
setLoading
]
=
useState(true);





const [
profile,
setProfile
]
=
useState(user);








useEffect(()=>{


const fetchProfile = async()=>{


try{


const response =
await api.get(
"/users/profile"
);



const userData =
response.data.user ||
response.data;



setProfile(
userData
);



setUser(
userData
);



localStorage.setItem(

"user",

JSON.stringify(userData)

);



}

catch(error){


console.error(
"Profile fetch error:",
error
);



toast.error(
"Unable to load profile"
);


}


finally{


setLoading(false);


}



};




fetchProfile();



},[
setUser
]);









if(loading){


return (

<div className="
min-h-screen
flex
items-center
justify-center
bg-gray-100
">


<p className="
text-xl
font-semibold
">

Loading profile...

</p>


</div>

);


}







if(!profile){


return (

<div className="
min-h-screen
flex
items-center
justify-center
"
>


<p className="
text-red-600
font-semibold
">

Please login to view your profile.

</p>


</div>

);


}









return (

<div className="
min-h-screen
bg-gray-100
p-6
">





<div className="
max-w-3xl
mx-auto
bg-white
rounded-2xl
shadow-xl
p-8
">






<h1 className="
text-4xl
font-bold
text-green-800
mb-8
">

My Profile

</h1>









<div className="
grid
md:grid-cols-2
gap-6
">





<div className="
bg-gray-50
rounded-xl
p-5
">


<p className="
text-gray-500
">

Full Name

</p>


<h2 className="
text-xl
font-bold
mt-2
">

{profile.name || "N/A"}

</h2>


</div>









<div className="
bg-gray-50
rounded-xl
p-5
">


<p className="
text-gray-500
">

Email Address

</p>


<h2 className="
text-xl
font-bold
mt-2
">

{profile.email || "N/A"}

</h2>


</div>









<div className="
bg-gray-50
rounded-xl
p-5
">


<p className="
text-gray-500
">

Account Type

</p>


<h2 className="
text-xl
font-bold
mt-2
capitalize
">

{

typeof profile.role === "object"

?

profile.role.name

:

profile.role || "Customer"

}


</h2>


</div>









<div className="
bg-gray-50
rounded-xl
p-5
">


<p className="
text-gray-500
">

Member Since

</p>


<h2 className="
text-xl
font-bold
mt-2
">

{

profile.createdAt

?

new Date(
profile.createdAt
)
.toDateString()

:

"N/A"

}


</h2>


</div>





</div>









{/* LOYALTY */}



<div className="
mt-8
bg-gradient-to-r
from-yellow-100
to-green-100
rounded-xl
p-6
">


<h2 className="
text-2xl
font-bold
">

Loyalty Rewards

</h2>




<p className="
mt-4
text-lg
">

Points:

<span className="
ml-2
font-bold
text-green-700
">

{

profile.loyaltyPoints || 0

}

</span>


</p>





<p className="
mt-2
text-gray-700
">

Continue exploring Kenya with Hussein Mboya Tours and earn more rewards.

</p>



</div>







</div>


</div>


);


}