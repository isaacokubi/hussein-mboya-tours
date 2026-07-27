import React,{useEffect,useState} from "react";
import {
getCustomers
}
from "../../api/tourManagerApi";


const Customers=()=>{


const [customers,setCustomers]=useState([]);



useEffect(()=>{


getCustomers()
.then(res=>
setCustomers(res.data)
);


},[]);



return (

<div className="p-6">


<h1 className="
text-3xl
font-bold
">
Customer CRM
</h1>



<div className="
grid
md:grid-cols-3
gap-5
mt-6
">


{
customers.map(customer=>(


<div

key={customer._id}

className="
bg-white
shadow
rounded-xl
p-5
"

>


<h2 className="font-bold">
{customer.name}
</h2>


<p>
Email:
{customer.email}
</p>


<p>
Bookings:
{customer.bookings?.length || 0}
</p>


</div>


))
}



</div>


</div>


)


}


export default Customers;