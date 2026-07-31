import {
  useParams,
  useNavigate
} from "react-router-dom";


import {
  useQuery,
  useMutation
} from "@tanstack/react-query";


import {
  useState
} from "react";


import {
  toast
} from "react-toastify";


import {
  getTourById
} from "../api/tourApi";


import {
  createBooking,
  initiatePayment
} from "../api/bookingApi";


import {
  useAuth
} from "../context/AuthContext";





export default function Checkout(){


const {
  id
}=useParams();



const navigate =
useNavigate();



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

data:tour,

isLoading

}=useQuery({

queryKey:[
"checkout-tour",
id
],


queryFn:
()=>getTourById(id)

});









/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/


const bookingMutation = useMutation({


mutationFn:createBooking,


onSuccess:async(data)=>{


try{


const booking =
data.booking || data;



toast.success(
"Booking created"
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


toast.error(

"Payment initiation failed"

);


}



},



onError(error){


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




bookingMutation.mutate({

tour:id,

travelDate:
form.travelDate,

travelers:
Number(form.travelers),

phone:
form.phone,

amount:
tour.price


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

Tour not found.

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
max-w-6xl
mx-auto
grid
md:grid-cols-2
gap-8
">








{/* TOUR SUMMARY */}


<div className="
bg-white
rounded-2xl
shadow
p-6
">


<img

src={

tour.images?.[0]?.url ||

tour.image ||

"/images/tour-placeholder.jpg"

}

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
text-gray-600
mt-3
">

{tour.description}

</p>




<div className="
mt-5
text-2xl
font-bold
text-green-700
">

KES {Number(tour.price).toLocaleString()}

</div>




</div>









{/* CHECKOUT FORM */}


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


<label className="
block
font-semibold
mb-2
">

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
rounded-lg
p-3
"

/>


</div>








<div>


<label className="
block
font-semibold
mb-2
">

Number of Travellers

</label>


<input

type="number"

min="1"

name="travelers"

value={form.travelers}

onChange={handleChange}

className="
w-full
border
rounded-lg
p-3
"

/>


</div>









<div>


<label className="
block
font-semibold
mb-2
">

M-Pesa Phone Number

</label>



<input

type="tel"

name="phone"

placeholder="07XXXXXXXX"

required

value={form.phone}

onChange={handleChange}

className="
w-full
border
rounded-lg
p-3
"

/>


</div>









<div className="
bg-green-50
rounded-xl
p-4
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

Number(tour.price)

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
hover:bg-green-800
disabled:opacity-50
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