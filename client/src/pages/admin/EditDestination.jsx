
import React, {useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import {useQuery,useMutation,useQueryClient} from "@tanstack/react-query";
import axios from "../../api/axios";


const EditDestination = ()=>{


const {id}=useParams();

const navigate=useNavigate();

const queryClient=useQueryClient();


const [images,setImages]=useState([]);


const [form,setForm]=useState({

name:"",
country:"",
city:"",
description:"",
featured:false,

seo:{
title:"",
metaDescription:"",
keywords:""
}

});



const {isLoading}=useQuery({

queryKey:["destination",id],

queryFn:async()=>{

const res=await axios.get(
`/admin/destinations/${id}`
);


const d=res.data.data || res.data.destination;


setForm({

name:d.name || "",

country:d.country || "",

city:d.city || "",

description:d.description || "",

featured:d.featured || false,


seo:{

title:d.seo?.title || "",

metaDescription:
d.seo?.metaDescription || "",


keywords:
d.seo?.keywords?.join(", ") || ""

}

});


return d;

}

});




const mutation=useMutation({

mutationFn:async()=>{


const data=new FormData();


data.append(
"name",
form.name
);


data.append(
"country",
form.country
);


data.append(
"city",
form.city
);


data.append(
"description",
form.description
);


data.append(
"featured",
form.featured
);


data.append(
"seo",
JSON.stringify({

title:form.seo.title,

metaDescription:
form.seo.metaDescription,


keywords:
form.seo.keywords
.split(",")
.map(k=>k.trim())
.filter(Boolean)

})
);



images.forEach(image=>{

data.append(
"images",
image
);

});



return axios.put(

`/admin/destinations/${id}`,

data,

{
headers:{
"Content-Type":"multipart/form-data"
}
}

);


},


onSuccess:()=>{


queryClient.invalidateQueries(
["admin-destinations"]
);


alert(
"Destination updated successfully"
);


navigate(
"/admin/destinations"
);


}


});




if(isLoading){

return <div className="p-6">
Loading...
</div>

}



return (

<div className="p-6 max-w-3xl">


<h1 className="text-3xl font-bold mb-6">
Edit Destination
</h1>



<div className="space-y-4">


{
["name","country","city"].map(field=>(

<input

key={field}

className="border p-3 rounded w-full"

placeholder={field}

value={form[field]}

onChange={e=>

setForm({

...form,

[field]:e.target.value

})

}

/>

))
}



<textarea

className="border p-3 rounded w-full"

rows="5"

placeholder="Description"

value={form.description}

onChange={e=>

setForm({

...form,

description:e.target.value

})

}

/>



<label className="flex gap-2">

<input

type="checkbox"

checked={form.featured}

onChange={e=>

setForm({

...form,

featured:e.target.checked

})

}

/>

Featured

</label>




<h2 className="font-bold text-xl">
SEO
</h2>



<input

className="border p-3 rounded w-full"

placeholder="SEO title"

value={form.seo.title}

onChange={e=>

setForm({

...form,

seo:{
...form.seo,
title:e.target.value
}

})

}

/>




<textarea

className="border p-3 rounded w-full"

placeholder="Meta description"

value={form.seo.metaDescription}

onChange={e=>

setForm({

...form,

seo:{
...form.seo,
metaDescription:e.target.value
}

})

}

/>




<input

className="border p-3 rounded w-full"

placeholder="keywords comma separated"

value={form.seo.keywords}

onChange={e=>

setForm({

...form,

seo:{
...form.seo,
keywords:e.target.value
}

})

}

/>




<h2 className="font-bold text-xl">
Images
</h2>


<input

type="file"

multiple

accept="image/*"

onChange={e=>

setImages(
Array.from(e.target.files)
)

}

/>




<button

disabled={mutation.isPending}

onClick={()=>
mutation.mutate()
}

className="
bg-green-600
text-white
px-6
py-3
rounded
"

>

{
mutation.isPending
?
"Saving..."
:
"Save Changes"
}

</button>


</div>


</div>

);


};


export default EditDestination;
