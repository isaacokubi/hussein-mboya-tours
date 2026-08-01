import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";

import {
  useState,
} from "react";

import {
  toast,
} from "react-toastify";

import {
  getTourById,
} from "../api/tourApi";

import {
  createBooking,
  initiatePayment,
} from "../api/bookingApi";

import {
  useAuth,
} from "../context/AuthContext";



export default function Checkout() {


const {
  id
}=useParams();


const navigate = useNavigate();


const {
  user
}=useAuth();



const [form,setForm]=useState({

  travelDate:"",

  travelers:1,

  phone:""

});





/*
|--------------------------------------------------------------------------
| LOAD TOUR
|--------------------------------------------------------------------------
*/

const {

data,

isLoading,

}=useQuery({

queryKey:[
"checkout-tour",
id
],


queryFn:()=>getTourById(id),

enabled:Boolean(id)

});



const tour =
data?.data || data;





/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/


const bookingMutation = useMutation({

mutationFn:createBooking,


onSuccess:async(response)=>{


try{


const booking =
response.booking || response.data?.booking;



if(!booking){

toast.error(
"Booking response invalid"
);

return;

}



toast.success(
"Booking created successfully"
);



await initiatePayment({

bookingId:
booking._id,

phone:
form.phone

});



navigate(
`/payment-status/${booking._id}`
);



}
catch(error){


console.log(error);


toast.error(
"Payment initiation failed"
);


}


},



onError(error){


console.log(error);


toast.error(

error?.response?.data?.message ||

"Booking failed"

);


}



});






const handleChange=(e)=>{


setForm({

...form,

[e.target.name]:

e.target.value

});


};







const handleSubmit=(e)=>{


e.preventDefault();



if(!user){


toast.error(
"Please login first"
);


navigate("/login");


return;


}



const count =
Number(form.travelers);



/*
|--------------------------------------------------------------------------
| CREATE TRAVELER ARRAY
|--------------------------------------------------------------------------
*/


const travelers =
Array.from(
{
length:count
},
(_,index)=>({

name:
`${user.name || "Traveler"} ${index+1}`,

age:0,

gender:"other",

passportNumber:"",

nationality:""

})
);





bookingMutation.mutate({

tour:id,


travelDate:
form.travelDate,


travelers,



contact:{


name:
user.name || "",


email:
user.email || "",


phone:
form.phone


},



paymentMethod:
"MPESA"


});


};









if(isLoading){


return (

<div className="
min-h-screen
flex
items-center
justify-center
">

Loading checkout...

</div>

);


}







if(!tour){


return (

<div className="
p-10
text-center
">

Tour not found

</div>

);


}






const image =
tour.featuredImage?.url ||

tour.images?.[0]?.url ||

tour.image ||

"/images/tour-placeholder.jpg";






return (

<div className="
min-h-screen
bg-gray-100
p-6
">


<div className="
max-w-6xl
mx-auto
grid
md:grid-cols-2
gap-8
">


<div className="
bg-white
rounded-2xl
shadow
p-6
">


<img

src={image}

alt={tour.title}

className="
h-64
w-full
object-cover
rounded-xl
"

/>



<h1 className="
text-3xl
font-bold
mt-5
">

{tour.title}

</h1>



<p className="
mt-3
text-gray-600
">

{tour.description}

</p>



<div className="
mt-5
text-2xl
font-bold
text-green-700
">

KES {Number(tour.price || 0).toLocaleString()}

</div>



</div>






<div className="
bg-white
rounded-2xl
shadow
p-8
">


<h2 className="
text-3xl
font-bold
mb-6
">

Complete Booking

</h2>





<form

onSubmit={handleSubmit}

className="
space-y-5
"

>



<div>

<label>
Travel Date
</label>


<input

type="date"

name="travelDate"

required

value={form.travelDate}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

/>


</div>







<div>

<label>
Number of Travellers
</label>


<input

type="number"

name="travellers"

min="1"

value={form.travelers}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

/>


</div>







<div>

<label>
M-Pesa Phone Number
</label>


<input

type="tel"

name="phone"

required

placeholder="07XXXXXXXX"

value={form.phone}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

/>


</div>








<div className="
bg-green-50
p-4
rounded-xl
">


<p>
You will pay:
</p>


<h3 className="
text-2xl
font-bold
text-green-700
">

KES {

(
Number(tour.price || 0)
*
Number(form.travelers)
)
.toLocaleString()

}

</h3>


</div>







<button

disabled={
bookingMutation.isPending
}

className="
w-full
bg-green-700
text-white
py-4
rounded-xl
font-bold
"

>


{
bookingMutation.isPending

?

"Processing..."

:

"Pay with M-Pesa"

}


</button>




</form>


</div>



</div>


</div>

);


}