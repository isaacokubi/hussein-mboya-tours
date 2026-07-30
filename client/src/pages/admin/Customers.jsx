import {

useEffect,

useState

}

from "react";



import {

getCustomers

}

from "../../api/customerApi";




export default function Customers(){


const [

customers,

setCustomers

]=useState([]);




const [

search,

setSearch

]=useState("");






const loadCustomers=async()=>{


const res =

await getCustomers({

search

});



setCustomers(

res.data.customers

);



};





useEffect(()=>{


loadCustomers();


},[]);







return (

<div className="p-6">


<h1 className="
text-3xl
font-bold
mb-8
">

Customer Management

</h1>






<div className="
flex
gap-4
mb-6
">


<input

className="
border
p-3
rounded
w-80
"

placeholder="
Search customers
"

value={search}

onChange={
e=>setSearch(e.target.value)
}

/>



<button

onClick={loadCustomers}

className="
bg-green-700
text-white
px-5
rounded
"

>

Search

</button>


</div>








<div className="
bg-white
shadow
rounded-xl
overflow-hidden
">


<table className="
w-full
">


<thead className="
bg-gray-100
">


<tr>


<th className="p-4">
Customer
</th>


<th className="p-4">
Phone
</th>


<th className="p-4">
Type
</th>


<th className="p-4">
Bookings
</th>


<th className="p-4">
Spent
</th>


</tr>


</thead>






<tbody>


{

customers.map(customer=>(


<tr

key={customer._id}

className="
border-b
">


<td className="p-4">

<div>

{customer.name}

</div>

<small>

{customer.email}

</small>

</td>





<td className="p-4">

{customer.phone}

</td>




<td className="p-4">


<span className="
bg-blue-100
px-3
py-1
rounded
">

{
customer.customerType
}

</span>


</td>





<td className="p-4">

{
customer.totalBookings
}

</td>




<td className="p-4">

KES {

customer.totalSpent

}

</td>



</tr>


))

}



</tbody>


</table>


</div>


</div>

);


}