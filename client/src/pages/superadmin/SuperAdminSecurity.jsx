import {useQuery} from "@tanstack/react-query";
import {getSecurity} from "../../api/superAdminApi";

export default function SuperAdminSecurity(){

const {data,isLoading}=useQuery({
queryKey:["security"],
queryFn:getSecurity
});

if(isLoading)
return <div className="p-6">Loading security...</div>


return (

<div className="p-6">

<h1 className="text-3xl font-bold mb-5">
Security Center
</h1>

<pre className="bg-white shadow rounded-xl p-5 overflow-auto">
{JSON.stringify(data,null,2)}
</pre>

</div>

)

}
