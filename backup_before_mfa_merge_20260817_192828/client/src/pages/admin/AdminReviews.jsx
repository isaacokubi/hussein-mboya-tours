import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminReviews,
  approveReview,
  rejectReview,
  deleteReview,
} from "../../api/adminReviewApi";

export default function AdminReviews() {

  const qc = useQueryClient();

  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("all");
  const [page,setPage] = useState(1);

  const limit = 10;


  const {
    data,
    isLoading,
    isError
  } = useQuery({
    queryKey:["admin-reviews"],
    queryFn:getAdminReviews
  });


  const reviews = data?.reviews || [];


  const mutation = useMutation({

    mutationFn: async({action,id})=>{

      if(action==="approve")
        return approveReview(id);

      if(action==="reject")
        return rejectReview(id);

      return deleteReview(id);

    },

    onSuccess(){
      qc.invalidateQueries({
        queryKey:["admin-reviews"]
      });
    }

  });



  const filtered = reviews.filter((review)=>{

    const text =
      `${review.user?.name || ""}
       ${review.user?.email || ""}
       ${review.tour?.title || ""}
       ${review.comment || ""}`
       .toLowerCase();


    const matchesSearch =
      text.includes(search.toLowerCase());


    const status =
      review.approved
      ? "approved"
      : review.rejected
      ? "rejected"
      : "pending";


    return matchesSearch &&
      (filter==="all" || filter===status);

  });


  const pages =
    Math.ceil(filtered.length / limit);


  const visible =
    filtered.slice(
      (page-1)*limit,
      page*limit
    );



  if(isLoading)
    return <div className="p-6">Loading reviews...</div>;


  if(isError)
    return (
      <div className="p-6 text-red-600">
        Failed to load reviews.
      </div>
    );



  const approved =
    reviews.filter(r=>r.approved).length;

  const pending =
    reviews.filter(r=>!r.approved && !r.rejected).length;

  const rejected =
    reviews.filter(r=>r.rejected).length;



return (

<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
Review Moderation
</h1>



<div className="grid md:grid-cols-4 gap-4">


<div className="bg-white shadow rounded-xl p-5">
<p>Total Reviews</p>
<h2 className="text-3xl font-bold">
{reviews.length}
</h2>
</div>


<div className="bg-white shadow rounded-xl p-5">
<p>Pending</p>
<h2 className="text-3xl font-bold text-yellow-600">
{pending}
</h2>
</div>


<div className="bg-white shadow rounded-xl p-5">
<p>Approved</p>
<h2 className="text-3xl font-bold text-green-600">
{approved}
</h2>
</div>


<div className="bg-white shadow rounded-xl p-5">
<p>Rejected</p>
<h2 className="text-3xl font-bold text-red-600">
{rejected}
</h2>
</div>


</div>




<div className="bg-white shadow rounded-xl p-4 flex flex-wrap gap-3">


<input
className="border rounded-lg p-3 flex-1"
placeholder="Search customer, tour or comment..."
value={search}
onChange={e=>{
setSearch(e.target.value);
setPage(1);
}}
/>


<select
className="border rounded-lg p-3"
value={filter}
onChange={e=>{
setFilter(e.target.value);
setPage(1);
}}
>

<option value="all">
All Reviews
</option>

<option value="pending">
Pending
</option>

<option value="approved">
Approved
</option>

<option value="rejected">
Rejected
</option>

</select>


</div>





<div className="bg-white shadow rounded-xl overflow-x-auto">


<table className="w-full">


<thead className="bg-gray-100">

<tr>

<th className="p-3 text-left">
Customer
</th>

<th>
Tour
</th>

<th>
Rating
</th>

<th>
Status
</th>

<th>
Action
</th>

</tr>

</thead>



<tbody>


{
visible.map(review=>(


<tr
key={review._id}
className="border-b"
>


<td className="p-3">

<p className="font-semibold">
{review.user?.name || "Customer"}
</p>

<p className="text-sm text-gray-500">
{review.user?.email}
</p>

<p className="text-sm mt-2">
{review.comment}
</p>

</td>


<td>
{review.tour?.title || "-"}
</td>


<td className="font-bold">
{"★".repeat(review.rating)}
</td>


<td>

{
review.approved ?

<span className="text-green-600">
Approved
</span>

:

review.rejected ?

<span className="text-red-600">
Rejected
</span>

:

<span className="text-yellow-600">
Pending
</span>

}

</td>


<td className="space-x-2">


{
!review.approved &&
<button
onClick={()=>
mutation.mutate({
action:"approve",
id:review._id
})
}
className="bg-green-600 text-white px-3 py-2 rounded"
>
Approve
</button>
}



{
!review.rejected &&
<button
onClick={()=>
mutation.mutate({
action:"reject",
id:review._id
})
}
className="bg-yellow-600 text-white px-3 py-2 rounded"
>
Reject
</button>
}



<button
onClick={()=>
mutation.mutate({
action:"delete",
id:review._id
})
}
className="bg-red-600 text-white px-3 py-2 rounded"
>
Delete
</button>



</td>


</tr>


))
}



{
!visible.length &&
<tr>
<td colSpan="5"
className="p-6 text-center text-gray-500">
No reviews found.
</td>
</tr>
}



</tbody>


</table>


</div>




<div className="flex justify-center gap-2">

{
Array.from({length:pages},(_,i)=>(

<button
key={i}
onClick={()=>setPage(i+1)}
className={
page===i+1
?"bg-green-700 text-white px-3 py-1 rounded"
:"border px-3 py-1 rounded"
}
>
{i+1}
</button>

))
}

</div>



</div>

);

}
