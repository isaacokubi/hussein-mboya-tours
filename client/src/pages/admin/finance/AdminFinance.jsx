import {
useEffect,
useState
}
from "react";


import {
getFinanceDashboard
}
from "../../../api/financeApi";



export default function AdminFinance(){


const [data,setData]=useState({});



useEffect(()=>{


getFinanceDashboard()

.then(res=>{


setData(
res.data.data
);


});


},[]);





return (

<div className="p-6">


<h1 className="
text-3xl
font-bold
mb-8
">

Finance Dashboard

</h1>





<div className="
grid
grid-cols-3
gap-6
">



<Card

title="Total Revenue"

value={`KES ${data.revenue || 0}`}

/>




<Card

title="Paid Bookings"

value={data.paidBookings || 0}

/>





<Card

title="Commission"

value={`KES ${data.commission || 0}`}

/>



</div>



</div>

);

}



function Card({

title,

value

}){


return (

<div className="
bg-white
shadow
rounded-xl
p-6
">


<p>

{title}

</p>


<h2 className="
text-3xl
font-bold
">

{value}

</h2>


</div>

);

}