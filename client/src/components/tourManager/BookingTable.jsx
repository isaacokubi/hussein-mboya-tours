import React from "react";


const bookings = [

{
id:"HB001",
customer:"Isaac Ogubi",
tour:"Maasai Mara Safari",
date:"26 July 2026",
status:"Paid"
},


{
id:"HB002",
customer:"Sarah Wanjiku",
tour:"Amboseli Adventure",
date:"28 July 2026",
status:"Pending"
},


{
id:"HB003",
customer:"John Mwangi",
tour:"Diani Beach Escape",
date:"30 July 2026",
status:"Confirmed"
}


];



const BookingTable =()=>{


return (

<div className="
bg-white
rounded-xl
shadow
p-6
overflow-x-auto
">


<h2 className="
text-xl
font-bold
mb-5
">
Recent Bookings
</h2>



<table className="
w-full
text-left
">


<thead>

<tr className="
border-b
text-gray-500
">

<th className="p-3">
ID
</th>

<th>
Customer
</th>

<th>
Tour
</th>

<th>
Date
</th>

<th>
Status
</th>


</tr>

</thead>



<tbody>


{
bookings.map((booking)=>(


<tr
key={booking.id}
className="
border-b
hover:bg-gray-50
"
>


<td className="p-3">
{booking.id}
</td>


<td>
{booking.customer}
</td>


<td>
{booking.tour}
</td>


<td>
{booking.date}
</td>


<td>

<span className="
px-3
py-1
rounded-full
bg-green-100
text-green-700
text-sm
">

{booking.status}

</span>

</td>


</tr>


))
}


</tbody>


</table>


</div>


)

}


export default BookingTable;