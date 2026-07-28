import {
useEffect,
useState
}
from "react";


import {
getReports
}
from "../../../api/financeApi";



export default function FinanceReports(){


const [reports,setReports]=useState([]);




useEffect(()=>{


getReports()

.then(res=>{


setReports(

res.data.monthlyRevenue

);


});


},[]);




return (

<div className="p-6">


<h1
className="
text-3xl
font-bold
mb-8
"
>

Financial Reports

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


<thead
className="
bg-gray-100
"
>

<tr>

<th className="p-4">
Month
</th>


<th className="p-4">
Revenue
</th>


</tr>

</thead>




<tbody>


{
reports.map(
(report,index)=>(


<tr key={index}>


<td className="p-4">

{
report._id.month
}/
{
report._id.year
}

</td>


<td className="p-4">

KES {report.revenue}

</td>


</tr>


)

)

}


</tbody>


</table>


</div>


</div>


);

}