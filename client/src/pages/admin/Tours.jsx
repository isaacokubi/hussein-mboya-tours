/**
 * Purpose: Tours page-level UI component. Main declarations: Tours.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import {
useQuery
} from "@tanstack/react-query";


// Load ../../api/adminApi so this module can use its exported dependencies.
import {
getAdminTours
} from "../../api/adminApi";


// Load ../../components/admin/DataTable so this module can use its exported dependencies.
import DataTable from "../../components/admin/DataTable";




// Define Tours; its parameters and body implement this operation.
export default function Tours(){



// Declare { data, isLoading } for use by the surrounding module or function.
const {
data,
isLoading
}=useQuery({

queryKey:[
"adminTours"
],

queryFn:getAdminTours

});





// Check the condition (isLoading) and run the matching branch.
if(isLoading)

// Return the expression shown below to the caller.
return <p className="p-6">
Loading tours...
</p>;





// Declare tours for use by the surrounding module or function.
const tours =
data?.data ||
data ||
[];





// Return the expression shown below to the caller.
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
