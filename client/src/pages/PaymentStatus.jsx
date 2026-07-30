import {
useParams
}
from "react-router-dom";


import {
useQuery
}
from "@tanstack/react-query";


import {
getBooking
}
from "../api/bookingApi";



export default function PaymentStatus(){


const {
id
}
=
useParams();



const {
data:booking,
isLoading
}
=
useQuery({

queryKey:[
"payment",
id
],

queryFn:
()=>getBooking(id),

refetchInterval:
5000

});



if(isLoading)

return (

<div>

Checking payment...

</div>

);



return (

<div
className="
min-h-screen
flex
items-center
justify-center
"
>


<div
className="
text-center
p-10
shadow-xl
rounded-xl
"
>


{

booking.paymentStatus === "paid"

?

<>

<h1
className="
text-4xl
text-green-600
font-bold
"
>

Payment Successful 🎉

</h1>


<p>

Your booking is confirmed.

</p>

</>


:

<>

<h1
className="
text-3xl
font-bold
"
>

Waiting for M-Pesa Payment

</h1>


<p>

Please enter your M-Pesa PIN.

</p>

</>

}



</div>


</div>

);


}