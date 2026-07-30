import {
    useState
} from "react";


import {
    useParams,
    useNavigate
} from "react-router-dom";


import {
    useQuery
} from "@tanstack/react-query";


import {
    getTourById
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


const {
    id
}=useParams();



const navigate =
useNavigate();





const {

data:tour,

isLoading

}=useQuery({

    queryKey:[
        "checkout-tour",
        id
    ],


    queryFn:
    ()=>getTourById(id),


    enabled:
    !!id

});







const [form,setForm]=useState({

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





const [loading,setLoading]=useState(false);







const handleChange=(e)=>{


setForm({

    ...form,

    [e.target.name]:
    e.target.value

});


};









const updateTraveler=(index,value)=>{


const updated=[

    ...form.travelers

];



updated[index]={

    ...updated[index],

    ...value

};



setForm({

    ...form,

    travelers:updated

});


};







const addTraveler=()=>{


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









const total =

tour

?

Number(tour.price) *

form.travelers.length

:

0;









const handleSubmit=async(e)=>{


e.preventDefault();



try{


setLoading(true);




// CREATE BOOKING FIRST

const booking =

await createBooking({


tour:id,


travelDate:
form.travelDate,



travelers:

form.travelers.map(
(item)=>({

name:
item.fullName,


nationality:
item.nationality

})

),



contact:{


name:
form.fullName,


email:
form.email,


phone:
form.phone

},



amount:
total,


paymentMethod:
"MPESA"



});







console.log(
"BOOKING CREATED",
booking
);







// MPESA PAYMENT

await initiateMpesa({


phone:
form.phone,


amount:
total,


bookingId:
booking._id


});







toast.success(
"M-Pesa payment request sent"
);






navigate(

`/payment-status/${booking._id}`

);





}

catch(error){


console.error(
error
);



toast.error(

error.response?.data?.message ||

"Payment failed"

);


}

finally{


setLoading(false);


}



};










if(isLoading){


return (

<div className="py-20 text-center">

Loading tour...

</div>

);


}









if(!tour){


return (

<div className="py-20 text-center">

Tour not found

</div>

);


}










return (

<div className="
container
mx-auto
px-6
py-20
">


<h1 className="
text-4xl
font-bold
mb-10
">

Complete Booking

</h1>








<div className="
bg-gray-100
p-6
rounded-xl
mb-8
">


<h2 className="
text-2xl
font-bold
">

{tour.title}

</h2>


<p>

KES {tour.price} per person

</p>


</div>







<form

onSubmit={handleSubmit}

className="
max-w-xl
space-y-5
"

>




<input

name="fullName"

placeholder="Full Name"

required

onChange={handleChange}

className="input"

/>






<input

name="email"

type="email"

placeholder="Email"

required

onChange={handleChange}

className="input"

/>






<input

name="phone"

placeholder="M-Pesa Phone Number"

required

onChange={handleChange}

className="input"

/>







<input

type="date"

name="travelDate"

required

onChange={handleChange}

className="input"

/>







<h2 className="
text-2xl
font-bold
">

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

placeholder="Traveler Name"

value={
traveler.fullName
}

className="input"


onChange={(e)=>

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

placeholder="Nationality"

value={
traveler.nationality
}

className="input"


onChange={(e)=>

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
"

>

Add Traveler

</button>









<div className="
bg-gray-100
p-5
rounded-xl
">


<h3 className="
font-bold
">

Total

</h3>


<p className="
text-3xl
font-bold
text-green-700
">

KES {total}

</p>


</div>







<button

disabled={loading}

className="
bg-green-600
text-white
px-8
py-4
rounded-full
font-bold
w-full
"

>


{

loading

?

"Processing Payment..."

:

"Pay With M-Pesa"

}



</button>






</form>


</div>


);


}