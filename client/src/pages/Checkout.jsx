import {
  useState
} from "react";

import {
  useSearchParams,
  useNavigate
} from "react-router-dom";

import {
  useQuery
} from "@tanstack/react-query";

import {
  getTourBySlug
} from "../api/tourApi";

import {
  createBooking
} from "../api/bookingApi";

import {
  initiateMpesa
} from "../api/mpesaApi";

import {
  toast
} from "react-toastify";



export default function Checkout(){


const [
params
]
=
useSearchParams();



const navigate =
useNavigate();



const tourSlug =
params.get("tour");



const [
form,
setForm
]
=
useState({

fullName:"",

email:"",

phone:"",

travelDate:"",


travelers:[

{
fullName:"",
nationality:""
}

]

});





const {
data:tour,
isLoading
}
=
useQuery({

queryKey:[
"checkout-tour",
tourSlug
],


queryFn:
()=>getTourBySlug(tourSlug),


enabled:
!!tourSlug

});








const updateTraveler = (

index,

value

)=>{


const updated =

[
...form.travelers
];



updated[index] =

{

...updated[index],

...value

};



setForm({

...form,

travelers:updated

});


};









const addTraveler = ()=>{


setForm({

...form,


travelers:[

...form.travelers,


{

fullName:"",

nationality:""

}

]


});


};







/*
|--------------------------------------------------------------------------
| TOTAL CALCULATION
|--------------------------------------------------------------------------
*/


const total =

tour

?

Number(tour.price) *

form.travelers.length

:

0;








/*
|--------------------------------------------------------------------------
| CREATE BOOKING + MPESA
|--------------------------------------------------------------------------
*/


const submitBooking = async(e)=>{


e.preventDefault();




if(!tour){


toast.error(
"Tour information missing"
);


return;

}





try{


const booking =

await createBooking({

tour:
tour._id,


travelDate:
form.travelDate,



travelers:

form.travelers.map(

(item)=>(

{

name:
item.fullName,


nationality:
item.nationality

}

)

),



contact:{


name:
form.fullName,


email:
form.email,


phone:
form.phone


},



paymentMethod:
"MPESA"


});







console.log(
"BOOKING CREATED:",
booking
);







await initiateMpesa({

phone:
form.phone,


bookingId:
booking._id

});








toast.success(
"M-Pesa prompt sent to your phone"
);






navigate(

`/payment-status/${booking._id}`

);






}

catch(error){


console.error(
"BOOKING ERROR:",
error
);



toast.error(

error.response?.data?.message ||

"Booking failed"

);


}



};








if(isLoading){


return (

<div
className="
p-10
text-center
"
>

Loading tour...

</div>

);


}









return (

<div

className="
max-w-5xl
mx-auto
p-8
"

>


<h1

className="
text-4xl
font-bold
mb-8
"

>

Complete Your Booking

</h1>








{

tour && (

<div

className="
bg-gray-100
p-5
rounded-xl
mb-6
"

>


<h2

className="
text-2xl
font-bold
"

>

{tour.title}

</h2>



<p>

KES {tour.price} per person

</p>



</div>


)

}









<form

onSubmit={submitBooking}

className="
space-y-6
"

>








<input

className="
input
"

placeholder="
Full Name
"

required


onChange={

e=>

setForm({

...form,

fullName:
e.target.value

})

}

/>








<input

className="
input
"

placeholder="
Email
"

type="email"

required


onChange={

e=>

setForm({

...form,

email:
e.target.value

})

}

/>








<input

className="
input
"

placeholder="
M-Pesa Phone Number
"

required


onChange={

e=>

setForm({

...form,

phone:
e.target.value

})

}

/>








<input

className="
input
"

type="date"

required


onChange={

e=>

setForm({

...form,

travelDate:
e.target.value

})

}

/>









<h2

className="
text-2xl
font-bold
"

>

Travelers

</h2>









{

form.travelers.map(

(traveler,index)=>(


<div

key={index}

className="
border
p-5
rounded-xl
space-y-3
"

>



<input

className="
input
"

placeholder="
Traveler Name
"

value={
traveler.fullName
}


onChange={

e=>

updateTraveler(

index,

{

fullName:
e.target.value

}

)

}

/>








<input

className="
input
"

placeholder="
Nationality
"

value={
traveler.nationality
}


onChange={

e=>

updateTraveler(

index,

{

nationality:
e.target.value

}

)

}

/>



</div>


)

)

}








<button

type="button"

onClick={addTraveler}

className="
border
px-5
py-2
rounded-lg
hover:bg-gray-100
"

>

Add Traveler

</button>









<div

className="
bg-gray-100
p-5
rounded-xl
"

>


<h2

className="
text-xl
font-bold
"

>

Total

</h2>



<p

className="
text-3xl
font-bold
text-green-700
"

>

KES {total}

</p>



</div>








<button

className="
bg-green-700
text-white
px-8
py-4
rounded-xl
w-full
hover:bg-green-800
transition
"

>

Pay With M-Pesa

</button>






</form>





</div>


);


}