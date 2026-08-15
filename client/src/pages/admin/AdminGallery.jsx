import {useState} from "react";
import {useQuery,useMutation,useQueryClient} from "@tanstack/react-query";
import api from "../../api/axios";
import {
 getAdminGallery,
 createGallery,
 updateGallery,
 deleteGallery
} from "../../api/adminGalleryApi";


export default function AdminGallery(){

const qc = useQueryClient();


const [editing,setEditing]=useState(null);

const [uploading,setUploading]=useState(false);


const [form,setForm]=useState({

title:"",
category:"Safari",
imageUrl:"",
publicId:"",
featured:false,
active:true

});



const {data:items=[],isLoading}=useQuery({

queryKey:["admin-gallery"],

queryFn:getAdminGallery

});





const uploadImage = async(e)=>{

const file=e.target.files[0];

if(!file) return;


const data=new FormData();

data.append("image",file);


try{

setUploading(true);


const res =
await api.post(
"/admin/gallery/upload",
data,
{
headers:{
"Content-Type":"multipart/form-data"
}
}
);


setForm(prev=>({

...prev,

imageUrl:res.data.image.url,

publicId:res.data.image.publicId

}));


}
catch(error){

console.error(
"GALLERY UPLOAD ERROR",
error.response?.data || error.message
);

alert("Image upload failed");


}
finally{

setUploading(false);

}

};





const saveMutation=useMutation({

mutationFn:()=>{

const payload={

title:form.title,

category:form.category,

featured:form.featured,

active:form.active,

imageUrl:form.imageUrl,

publicId:form.publicId

};


return editing
?
updateGallery(editing,payload)
:
createGallery(payload);

},


onSuccess:()=>{

qc.invalidateQueries({
queryKey:["admin-gallery"]
});


setEditing(null);


setForm({

title:"",
category:"Safari",
imageUrl:"",
publicId:"",
featured:false,
active:true

});

}

});





const removeMutation=useMutation({

mutationFn:deleteGallery,


onSuccess:()=>{

qc.invalidateQueries({
queryKey:["admin-gallery"]
});

}

});





const edit=(item)=>{

setEditing(item._id);


setForm({

title:item.title,

category:item.category,

imageUrl:item.image?.url || "",

publicId:item.image?.publicId || "",

featured:item.featured,

active:item.active

});

};





if(isLoading)
return <div className="p-6">
Loading gallery...
</div>;




return (

<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
Gallery Management
</h1>



<div className="bg-white shadow rounded-xl p-5 space-y-4">


<input
className="border p-3 rounded w-full"
placeholder="Gallery title"
value={form.title}
onChange={
e=>setForm({...form,title:e.target.value})
}
/>



<select
className="border p-3 rounded w-full"
value={form.category}
onChange={
e=>setForm({...form,category:e.target.value})
}
>

<option>Safari</option>
<option>Beach</option>
<option>Culture</option>
<option>Adventure</option>
<option>Vehicle</option>

</select>




<input
type="file"
accept="image/*"
onChange={uploadImage}
/>


{uploading &&
<p className="text-blue-600">
Uploading image...
</p>
}



{form.imageUrl &&

<img
src={form.imageUrl}
className="w-48 h-32 object-cover rounded"
/>

}



<label className="flex gap-2">

<input
type="checkbox"
checked={form.featured}
onChange={
e=>setForm({...form,featured:e.target.checked})
}
/>

Featured

</label>



<label className="flex gap-2">

<input
type="checkbox"
checked={form.active}
onChange={
e=>setForm({...form,active:e.target.checked})
}
/>

Active

</label>




<button

disabled={uploading}

onClick={()=>saveMutation.mutate()}

className="bg-green-700 text-white px-5 py-2 rounded"

>

{editing?"Update Gallery":"Add Gallery"}

</button>


</div>






<div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">


{items.map(item=>(


<div
key={item._id}
className="bg-white rounded-xl shadow overflow-hidden"
>


<img

src={item.image?.url}

alt={item.title}

className="w-full h-48 object-cover"

/>


<div className="p-4 space-y-2">


<h2 className="font-bold">
{item.title}
</h2>


<p>
{item.category}
</p>



<div className="flex gap-2">


<button

onClick={()=>edit(item)}

className="bg-blue-600 text-white px-3 py-1 rounded"

>

Edit

</button>




<button

onClick={()=>{

if(confirm("Delete this gallery item?"))
removeMutation.mutate(item._id);

}}

className="bg-red-600 text-white px-3 py-1 rounded"

>

Delete

</button>


</div>


</div>


</div>


))}


</div>


</div>

);


}
