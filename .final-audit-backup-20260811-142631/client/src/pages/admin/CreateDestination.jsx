import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";

import {
  createDestination
} from "../../api/adminDestinationApi";


const CreateDestination = () => {

  const navigate = useNavigate();

  const [form,setForm] = useState({
    name:"",
    slug:"",
    description:"",
    country:"",
    city:"",
    featured:false,
    images:[]
  });


  const mutation = useMutation({

    mutationFn:createDestination,

    onSuccess:()=>{

      alert("Destination created successfully");

      navigate("/admin/destinations");

    },

    onError:(error)=>{

      console.error(
        "CREATE DESTINATION ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed creating destination"
      );

    }

  });



  const handleChange=(e)=>{

    const {name,value,type,checked}=e.target;

    setForm({
      ...form,
      [name]:
        type==="checkbox"
        ? checked
        : value
    });

  };


  const handleImages=(e)=>{

    setForm({
      ...form,
      images:e.target.files
    });

  };


  const handleSubmit=(e)=>{

    e.preventDefault();

    const data = new FormData();

    Object.keys(form).forEach((key)=>{

      if(key==="images"){

        Array.from(form.images).forEach(file=>{

          data.append("images",file);

        });

      }else{

        data.append(key,form[key]);

      }

    });


    mutation.mutate(data);

  };


return (

<div className="p-6">

<h1 className="text-3xl font-bold mb-6">
Create Destination
</h1>


<form
onSubmit={handleSubmit}
className="bg-white shadow rounded p-6 space-y-4"
>


<input
name="name"
placeholder="Destination Name"
value={form.name}
onChange={handleChange}
className="border p-2 w-full"
/>


<input
name="slug"
placeholder="Slug"
value={form.slug}
onChange={handleChange}
className="border p-2 w-full"
/>


<input
name="country"
placeholder="Country"
value={form.country}
onChange={handleChange}
className="border p-2 w-full"
/>


<input
name="city"
placeholder="City"
value={form.city}
onChange={handleChange}
className="border p-2 w-full"
/>


<textarea
name="description"
placeholder="Description"
value={form.description}
onChange={handleChange}
className="border p-2 w-full"
/>



<label className="flex gap-2">

<input
type="checkbox"
name="featured"
checked={form.featured}
onChange={handleChange}
/>

Featured Destination

</label>



<input
type="file"
multiple
onChange={handleImages}
/>



<button
disabled={mutation.isPending}
className="bg-green-600 text-white px-5 py-2 rounded"
>

{
mutation.isPending
?
"Saving..."
:
"Create Destination"
}

</button>


</form>

</div>

);

};


export default CreateDestination;
