/**
 * Purpose: Create Destination page-level UI component. Main declarations: CreateDestination, handleChange, handleImages, handleSubmit.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import {useState} from "react";
// Load react-router-dom so this module can use its exported dependencies.
import {useNavigate} from "react-router-dom";
// Load @tanstack/react-query so this module can use its exported dependencies.
import {useMutation} from "@tanstack/react-query";

// Load ../../api/adminDestinationApi so this module can use its exported dependencies.
import {
  createDestination
} from "../../api/adminDestinationApi";


// Declare CreateDestination for use by the surrounding module or function.
const CreateDestination = () => {

  // Declare navigate for use by the surrounding module or function.
  const navigate = useNavigate();

  // Declare [form,setForm] for use by the surrounding module or function.
  const [form,setForm] = useState({
    name:"",
    slug:"",
    description:"",
    country:"",
    city:"",
    featured:false,
    images:[]
  });


  // Declare mutation for use by the surrounding module or function.
  const mutation = useMutation({

    mutationFn:createDestination,

    onSuccess:()=>{

      // Perform the side effect or state update expressed on the following line.
      alert("Destination created successfully");

      // Perform the side effect or state update expressed on the following line.
      navigate("/admin/destinations");

    },

    onError:(error)=>{

      // Perform the side effect or state update expressed on the following line.
      console.error(
        "CREATE DESTINATION ERROR:",
        error
      );

      // Perform the side effect or state update expressed on the following line.
      alert(
        error.response?.data?.message ||
        "Failed creating destination"
      );

    }

  });



  // Declare handleChange for use by the surrounding module or function.
  const handleChange=(e)=>{

    // Declare {name,value,type,checked} for use by the surrounding module or function.
    const {name,value,type,checked}=e.target;

    // Perform the side effect or state update expressed on the following line.
    setForm({
      ...form,
      [name]:
        type==="checkbox"
        ? checked
        : value
    });

  };


  // Declare handleImages for use by the surrounding module or function.
  const handleImages=(e)=>{

    // Perform the side effect or state update expressed on the following line.
    setForm({
      ...form,
      images:e.target.files
    });

  };


  // Declare handleSubmit for use by the surrounding module or function.
  const handleSubmit=(e)=>{

    // Perform the side effect or state update expressed on the following line.
    e.preventDefault();

    // Declare data for use by the surrounding module or function.
    const data = new FormData();

    // Perform the side effect or state update expressed on the following line.
    Object.keys(form).forEach((key)=>{

      // Check the condition (key==="images") and run the matching branch.
      if(key==="images"){

        // Perform the side effect or state update expressed on the following line.
        Array.from(form.images).forEach(file=>{

          // Perform the side effect or state update expressed on the following line.
          data.append("images",file);

        });

      }else{

        // Perform the side effect or state update expressed on the following line.
        data.append(key,form[key]);

      }

    });


    // Perform the side effect or state update expressed on the following line.
    mutation.mutate(data);

  };


// Return the expression shown below to the caller.
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
