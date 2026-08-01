import {
useQuery
}
from "@tanstack/react-query";


import {
getAdminBookings
}
from "../../api/adminApi";


import DataTable from "../../components/admin/DataTable";




export default function Bookings(){



const {
data,
isLoading
}=useQuery({

queryKey:[
"adminBookings"
],

queryFn:getAdminBookings


});





if(isLoading)

return <p className="p-6">
Loading bookings...
</p>;





const bookings =
data?.data ||
data ||
[];




return (

<div className="p-6">


<h1 className="
text-3xl
font-bold
mb-6
">

Booking Management

</h1>




<DataTable


data={bookings}


columns={[


{
label:"Customer",
key:"customer",

render:(b)=>
b.customer?.name || "-"
},



{
label:"Tour",
key:"tour",

render:(b)=>
b.tour?.title || "-"
},



{
label:"Amount",
key:"totalAmount",

render:(b)=>
`Ksh ${b.totalAmount}`
},



{
label:"Payment",
key:"paymentStatus"
},



{
label:"Status",
key:"bookingStatus"
}


]}


/>



</div>

)


}