import useAgentCustomers
from "../../hooks/useAgentCustomers";



export default function AgentCustomers(){


const {

data,

isLoading

}

=
useAgentCustomers();



if(isLoading)

return (

<div>

Loading customers...

</div>

);



return (

<div>


<h1
className="
text-2xl
font-bold
mb-6
">

My Customers

</h1>



<div
className="
bg-white
rounded-xl
shadow
"
>


<table
className="
w-full
"
>


<thead>

<tr
className="
border-b
"
>

<th>
Name
</th>


<th>
Phone
</th>


<th>
Nationality
</th>


<th>
Status
</th>

</tr>


</thead>



<tbody>


{

data.map(customer=>(


<tr

key={customer._id}

className="
border-b
"

>


<td>

{
customer.firstName
}

{" "}

{
customer.lastName
}


</td>



<td>

{
customer.phone
}

</td>



<td>

{
customer.nationality || "-"
}

</td>



<td>

{
customer.status
}

</td>


</tr>


))


}



</tbody>


</table>


</div>


</div>

)

}