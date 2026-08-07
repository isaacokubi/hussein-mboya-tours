import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";

import {
getAgents,
approveAgent,
updateAgentStatus
} from "../../api/adminAgentApi";


export default function Agents(){

const queryClient = useQueryClient();


const {
data=[],
isLoading
}=useQuery({

queryKey:["agents"],

queryFn:getAgents

});



const approveMutation = useMutation({

mutationFn:approveAgent,

onSuccess(){

queryClient.invalidateQueries({
queryKey:["agents"]
});

}

});



const statusMutation = useMutation({

mutationFn:({id,status})=>
updateAgentStatus(id,status),

onSuccess(){

queryClient.invalidateQueries({
queryKey:["agents"]
});

}

});



if(isLoading)

return (
<div className="p-6">
Loading agents...
</div>
);



return (

<div className="p-6">


<h1 className="text-2xl font-bold mb-5">
Agents Management
</h1>



<div className="bg-white rounded-xl shadow overflow-x-auto">


<table className="w-full">


<thead>

<tr className="border-b">

<th className="p-3 text-left">
Company
</th>


<th className="p-3 text-left">
Agent
</th>


<th className="p-3 text-left">
Location
</th>


<th className="p-3 text-left">
Bookings
</th>


<th className="p-3 text-left">
Commission
</th>


<th className="p-3 text-left">
Status
</th>


<th className="p-3 text-left">
Actions
</th>


</tr>

</thead>



<tbody>


{
data.map(agent=>(


<tr
key={agent._id}
className="border-b"
>


<td className="p-3">
{agent.companyName || "-"}
</td>



<td className="p-3">

<div>
{agent.user?.name || "-"}
</div>

<div className="text-sm text-gray-500">
{agent.user?.email}
</div>

</td>



<td className="p-3">
{agent.location}
</td>



<td className="p-3">
{agent.totalBookings}
</td>



<td className="p-3">
KES {agent.totalCommission}
</td>



<td className="p-3">

<select

value={agent.status}

onChange={(e)=>
statusMutation.mutate({

id:agent._id,

status:e.target.value

})
}

className="border rounded p-1"

>

<option value="active">
Active
</option>

<option value="inactive">
Inactive
</option>

<option value="suspended">
Suspended
</option>

</select>


</td>




<td className="p-3">


{
!agent.isApproved &&

<button

onClick={()=>
approveMutation.mutate(agent._id)
}

className="bg-green-600 text-white px-3 py-1 rounded"

>

Approve

</button>

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
