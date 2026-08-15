import { useMemo, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";

import {
  getAdminGallery,
  createGallery,
  updateGallery,
  deleteGallery
} from "../../api/adminGalleryApi";


const emptyForm = {
  title:"",
  category:"Safari",
  imageUrl:"",
  featured:false,
  active:true
};


export default function AdminGallery(){

const qc = useQueryClient();

const [form,setForm] = useState(emptyForm);
const [editing,setEditing] = useState(null);
const [search,setSearch] = useState("");
const [category,setCategory] = useState("");


const {data:items=[],isLoading}=useQuery({
  queryKey:["admin-gallery"],
  queryFn:getAdminGallery
});


const filteredItems = useMemo(()=>{

return items.filter(item=>{

const matchesSearch =
item.title
?.toLowerCase()
.includes(search.toLowerCase());

const matchesCategory =
!category ||
item.category===category;

return matchesSearch && matchesCategory;

});

},[items,search,category]);



const saveMutation = useMutation({

mutationFn:()=>{

const payload={
 title:form.title,
 category:form.category,
 featured:form.featured,
 active:form.active,
 imageUrl:form.imageUrl
};


return editing
? updateGallery(editing,{
    title:form.title,
    category:form.category,
    featured:form.featured,
    active:form.active,
    image:{
      url:form.imageUrl
    }
  })
: createGallery(payload);

},


onSuccess(){

qc.invalidateQueries({
queryKey:["admin-gallery"]
});

setEditing(null);
setForm(emptyForm);

},


onError(error){

console.error(
"GALLERY ERROR",
error.response?.data || error.message
);

alert(
error.response?.data?.message ||
"Gallery operation failed"
);

}

});



const deleteMutation = useMutation({

mutationFn:(id)=>{

if(!window.confirm(
"Delete this gallery item?"
)){
return;
}

return deleteGallery(id);

},


onSuccess(){

qc.invalidateQueries({
queryKey:["admin-gallery"]
});

}

});



function editItem(item){

setEditing(item._id);

setForm({
title:item.title || "",
category:item.category || "Safari",
imageUrl:item.image?.url || "",
featured:item.featured || false,
active:item.active !== false
});

window.scrollTo({
top:0,
behavior:"smooth"
});

}



if(isLoading)
return (
<div className="p-6">
Loading gallery...
</div>
);



return (

<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
Gallery Management
</h1>



<div className="bg-white rounded-xl shadow p-5 space-y-4">


<input
className="border p-3 rounded w-full"
placeholder="Title"
value={form.title}
onChange={
e=>setForm({
...form,
title:e.target.value
})
}
/>



<select
className="border p-3 rounded w-full"
value={form.category}
onChange={
e=>setForm({
...form,
category:e.target.value
})
}
>

<option>Safari</option>
<option>Beach</option>
<option>Culture</option>
<option>Adventure</option>
<option>Vehicle</option>

</select>



<input
className="border p-3 rounded w-full"
placeholder="Cloudinary Image URL"
value={form.imageUrl}
onChange={
e=>setForm({
...form,
imageUrl:e.target.value
})
}
/>


{
form.imageUrl &&
<img
src={form.imageUrl}
alt="preview"
className="h-40 rounded object-cover"
/>
}



<label className="flex gap-2">
<input
type="checkbox"
checked={form.featured}
onChange={
e=>setForm({
...form,
featured:e.target.checked
})
}
/>
Featured
</label>



<label className="flex gap-2">
<input
type="checkbox"
checked={form.active}
onChange={
e=>setForm({
...form,
active:e.target.checked
})
}
/>
Active
</label>




<div className="flex gap-3">


<button
disabled={saveMutation.isPending}
onClick={()=>saveMutation.mutate()}
className="bg-green-700 text-white px-5 py-2 rounded"
>

{
saveMutation.isPending
?
"Saving..."
:
editing
?
"Update Gallery"
:
"Add Gallery"
}

</button>


{
editing &&
<button
onClick={()=>{

setEditing(null);
setForm(emptyForm);

}}
className="bg-gray-500 text-white px-5 py-2 rounded"
>
Cancel
</button>
}


</div>


</div>



<div className="flex gap-3">


<input
className="border p-3 rounded flex-1"
placeholder="Search gallery..."
value={search}
onChange={
e=>setSearch(e.target.value)
}
/>


<select
className="border p-3 rounded"
value={category}
onChange={
e=>setCategory(e.target.value)
}
>

<option value="">
All Categories
</option>

<option>Safari</option>
<option>Beach</option>
<option>Culture</option>
<option>Adventure</option>
<option>Vehicle</option>

</select>


</div>



<div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">


{
filteredItems.map(item=>(

<div
key={item._id}
className="bg-white shadow rounded-xl overflow-hidden"
>


<img
src={item.image?.url}
alt={item.title}
className="h-48 w-full object-cover"
/>



<div className="p-4 space-y-3">


<h2 className="font-bold">
{item.title}
</h2>


<p className="text-sm text-gray-500">
{item.category}
</p>


<div className="flex gap-2 text-sm">

{
item.featured &&
<span className="bg-yellow-100 px-2 py-1 rounded">
⭐ Featured
</span>
}

{
item.active &&
<span className="bg-green-100 px-2 py-1 rounded">
✓ Active
</span>
}

</div>



<div className="flex gap-2">


<button
onClick={()=>editItem(item)}
className="bg-blue-600 text-white px-3 py-1 rounded"
>
Edit
</button>


<button
disabled={deleteMutation.isPending}
onClick={()=>deleteMutation.mutate(item._id)}
className="bg-red-600 text-white px-3 py-1 rounded"
>
{
deleteMutation.isPending
?
"Deleting..."
:
"Delete"
}
</button>


</div>


</div>


</div>

))

}


</div>


</div>

);

}
