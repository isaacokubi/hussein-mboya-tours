import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useMutation, useQuery} from "@tanstack/react-query";

import {
  getDestination,
  updateDestination
} from "../../api/adminDestinationApi";


const EditDestination = () => {

  const {id} = useParams();

  const navigate = useNavigate();


  const [form,setForm] = useState({
    name:"",
    slug:"",
    country:"",
    city:"",
    description:"",
    featured:false,
    images:[]
  });


  const {data,isLoading}=useQuery({
    queryKey:["destination",id],
    queryFn:()=>getDestination(id)
  });



  useEffect(()=>{

    const destination =
      data?.destination || data?.data || data;

    if(destination){

      setForm({

        name:destination.name || "",

        slug:destination.slug || "",

        country:destination.country || "",

        city:destination.city || "",

        description:destination.description || "",

        featured:destination.featured || false,

        images:[]

      });

    }

  },[data]);



  const mutation = useMutation({

    mutationFn:updateDestination,


    onSuccess:()=>{

      alert(
        "Destination updated successfully"
      );

      navigate("/admin/destinations");

    },


    onError:(error)=>{

      console.error(
        error
      );

      alert(
        error.response?.data?.message ||
        "Update failed"
      );

    }

  });



  const handleChange=(e)=>{

    const {
      name,
      value,
      checked,
      type
    }=e.target;


    setForm({

      ...form,

      [name]:
      type==="checkbox"
      ?
      checked
      :
      value

    });

  };



  const handleImages=(e)=>{

    setForm({

      ...form,

      images:e.target.files

    });

  };



  const submit=(e)=>{

    e.preventDefault();


    const body=new FormData();


    Object.keys(form).forEach(key=>{


      if(key==="images"){

        Array.from(form.images)
        .forEach(file=>{

          body.append(
            "images",
            file
          );

        });


      }else{

        body.append(
          key,
          form[key]
        );

      }


    });


    mutation.mutate({
      id,
      data:body
    });

  };



  if(isLoading)
  return (
    <div className="p-6">
      Loading...
    </div>
  );


return (

<div className="p-6">


<h1 className="text-3xl font-bold mb-6">
Edit Destination
</h1>


<form
onSubmit={submit}
className="bg-white shadow rounded p-6 space-y-4"
>


<input
name="name"
value={form.name}
onChange={handleChange}
className="border p-2 w-full"
/>


<input
name="slug"
value={form.slug}
onChange={handleChange}
className="border p-2 w-full"
/>


<input
name="country"
value={form.country}
onChange={handleChange}
className="border p-2 w-full"
/>


<input
name="city"
value={form.city}
onChange={handleChange}
className="border p-2 w-full"
/>


<textarea
name="description"
value={form.description}
onChange={handleChange}
className="border p-2 w-full"
/>



<label>

<input
type="checkbox"
name="featured"
checked={form.featured}
onChange={handleChange}
/>

 Featured

</label>



<input
type="file"
multiple
onChange={handleImages}
/>


<button
className="
bg-blue-600
text-white
px-5
py-2
rounded
"
>

Update Destination

</button>


</form>


</div>

);

};


export default EditDestination;
