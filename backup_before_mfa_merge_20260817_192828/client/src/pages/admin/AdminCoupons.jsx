
import { useEffect, useState } from "react";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from "../../api/couponApi";


export default function AdminCoupons(){

const [coupons,setCoupons]=useState([]);
const [loading,setLoading]=useState(true);
const [error,setError]=useState("");

const [editing,setEditing]=useState(null);
const [showForm,setShowForm]=useState(false);
const [search,setSearch]=useState("");
const [page,setPage]=useState(1);

const [form,setForm]=useState({
code:"",
description:"",
discountType:"percentage",
amount:"",
expiresAt:"",
usageLimit:1
});


const reset=()=>{
setForm({
code:"",
description:"",
discountType:"percentage",
amount:"",
expiresAt:"",
usageLimit:1
});
setEditing(null);
setShowForm(false);
};


const load=async()=>{
try{
setLoading(true);
setError("");

const res=await getCoupons();

setCoupons(res.coupons || []);

}catch(err){

setError(
err?.response?.data?.message ||
"Failed to load coupons"
);

}
finally{
setLoading(false);
}

};


useEffect(()=>{
load();
},[]);



const submit=async(e)=>{
e.preventDefault();

try{

const payload={
...form,
amount:Number(form.amount),
usageLimit:Number(form.usageLimit)
};


if(editing){

await updateCoupon(editing._id,payload);

}else{

await createCoupon(payload);

}


reset();
load();


}catch(err){

setError(
err?.response?.data?.message ||
"Coupon operation failed"
);

}

};



const remove=async(id)=>{

if(!window.confirm("Delete this coupon?")) return;


try{

await deleteCoupon(id);
load();

}catch(err){

setError(
err?.response?.data?.message ||
"Delete failed"
);

}

};



const edit=(coupon)=>{

setShowForm(true);
setEditing(coupon);

setForm({
code:coupon.code,
description:coupon.description || "",
discountType:coupon.discountType,
amount:coupon.amount,
expiresAt:coupon.expiresAt?.slice(0,10),
usageLimit:coupon.usageLimit
});

};



const filtered=coupons.filter(c=>
c.code.toLowerCase()
.includes(search.toLowerCase())
);


const perPage=10;

const pages=Math.ceil(filtered.length/perPage);

const rows=filtered.slice(
(page-1)*perPage,
page*perPage
);



const active=coupons.filter(
c=>c.active && new Date(c.expiresAt)>new Date()
).length;


const expired=coupons.length-active;



return (

<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
Coupon Management
</h1>


<div className="grid md:grid-cols-4 gap-4">


<div className="bg-white rounded-xl shadow p-5">
<p>Total Coupons</p>
<h2 className="text-3xl font-bold">
{coupons.length}
</h2>
</div>


<div className="bg-white rounded-xl shadow p-5">
<p>Active</p>
<h2 className="text-3xl font-bold text-green-700">
{active}
</h2>
</div>


<div className="bg-white rounded-xl shadow p-5">
<p>Expired</p>
<h2 className="text-3xl font-bold text-red-700">
{expired}
</h2>
</div>


<div className="bg-white rounded-xl shadow p-5">
<p>Total Usage</p>
<h2 className="text-3xl font-bold">
{coupons.reduce((a,c)=>a+c.usedCount,0)}
</h2>
</div>


</div>



{error &&

<div className="bg-red-100 text-red-700 p-4 rounded">

{error}

</div>

}



<div className="bg-white rounded-xl shadow p-5">


<div className="flex justify-between mb-5">


<input
className="border p-3 rounded"
placeholder="Search coupon..."
value={search}
onChange={e=>setSearch(e.target.value)}
/>


<button
onClick={()=>{
reset();
setShowForm(true);
}}
className="bg-green-700 text-white px-5 rounded"
>
Create Coupon
</button>


</div>



{(showForm || editing) &&

<form
onSubmit={submit}
className="grid md:grid-cols-3 gap-4 mb-6"
>


<input
required
className="border p-3 rounded"
placeholder="Code"
value={form.code}
onChange={e=>setForm({...form,code:e.target.value})}
/>


<input
className="border p-3 rounded"
placeholder="Description"
value={form.description}
onChange={e=>setForm({...form,description:e.target.value})}
/>


<select
className="border p-3 rounded"
value={form.discountType}
onChange={e=>setForm({...form,discountType:e.target.value})}
>

<option value="percentage">
Percentage
</option>

<option value="fixed">
Fixed
</option>

</select>



<input
type="number"
className="border p-3 rounded"
placeholder="Amount"
value={form.amount}
onChange={e=>setForm({...form,amount:e.target.value})}
/>



<input
type="date"
className="border p-3 rounded"
value={form.expiresAt}
onChange={e=>setForm({...form,expiresAt:e.target.value})}
/>



<input
type="number"
className="border p-3 rounded"
value={form.usageLimit}
onChange={e=>setForm({...form,usageLimit:e.target.value})}
/>


<button className="bg-blue-700 text-white rounded px-5">

{editing?"Update":"Save"}

</button>


</form>

}




<div className="overflow-auto">

<table className="w-full">


<thead>
<tr className="border-b">

<th className="p-3 text-left">Code</th>
<th>Discount</th>
<th>Expiry</th>
<th>Status</th>
<th>Usage</th>
<th>Actions</th>

</tr>
</thead>


<tbody>


{loading &&

<tr>
<td className="p-5">
Loading...
</td>
</tr>

}



{!loading && rows.map(c=>(

<tr key={c._id} className="border-b">


<td className="p-3 font-bold">
{c.code}
</td>


<td>
{c.amount}
{c.discountType==="percentage"?"%":""}
</td>


<td>
{new Date(c.expiresAt).toLocaleDateString()}
</td>


<td>

<span className={
new Date(c.expiresAt)<new Date()
?"text-red-700"
:"text-green-700"
}>

{
new Date(c.expiresAt)<new Date()
?"Expired"
:"Active"
}

</span>

</td>


<td>
{c.usedCount}/{c.usageLimit}
</td>


<td className="space-x-3">

<button
className="text-blue-700"
onClick={()=>edit(c)}
>
Edit
</button>


<button
className="text-red-700"
onClick={()=>remove(c._id)}
>
Delete
</button>


</td>


</tr>

))}


</tbody>

</table>

</div>


<div className="flex gap-2 mt-5">

{
Array.from({length:pages},(_,i)=>(

<button
key={i}
onClick={()=>setPage(i+1)}
className="border px-3 py-1 rounded"
>

{i+1}

</button>

))
}

</div>


</div>

</div>

);

}
