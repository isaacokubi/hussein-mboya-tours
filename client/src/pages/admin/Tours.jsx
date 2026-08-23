import {
useQuery
} from "@tanstack/react-query";


import {
getAdminTours
} from "../../api/adminApi";


import DataTable from "../../components/admin/DataTable";




export default function Tours(){



const {
data,
isLoading
}=useQuery({

queryKey:[
"adminTours"
],

queryFn:getAdminTours

});





if(isLoading)

return <p className="p-6">
Loading tours...
</p>;





const tours =
data?.data ||
data ||
[];





return (

<div className="
p-6
space-y-6
">


<h1 className="
text-3xl
font-bold
">

Tours Management

</h1>





<DataTable

data={tours}


columns={[


{
label:"Title",
key:"title"
},



{
label:"Destination",
key:"destination"
},



{
label:"Price",
key:"price",

render:(tour)=>
`Ksh ${tour.price}`
},



{
label:"Status",
key:"status"
}



]}


/>



</div>


)


}
