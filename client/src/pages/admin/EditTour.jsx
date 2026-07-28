import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
    getTour,
    updateTour
} from "../../api/tourApi";



export default function EditTour(){


const {
    id
} = useParams();


const navigate = useNavigate();



const [loading,setLoading] = useState(true);

const [saving,setSaving] = useState(false);



const [formData,setFormData] = useState({

    title:"",
    
    description:"",

    shortDescription:"",

    category:"Safari",

    country:"Kenya",

    location:"",

    date:"",

    duration:"",

    capacity:20,

    maxTravelers:20,

    price:0,

    discount:0,

    discountPrice:"",

    image:"",

    images:[],

    highlights:[],

    inclusions:[],

    exclusions:[],

    status:"upcoming",

    featured:false,

    available:true

});






/*
|--------------------------------------------------------------------------
| LOAD TOUR
|--------------------------------------------------------------------------
*/


useEffect(()=>{


    const loadTour = async()=>{


        try{


            const response = await getTour(id);



            const tour = response.tour || response.data || response;



            setFormData({

                title:tour.title || "",

                description:tour.description || "",

                shortDescription:
                    tour.shortDescription || "",

                category:
                    tour.category || "Safari",

                country:
                    tour.country || "Kenya",

                location:
                    tour.location || "",

                date:
                    tour.date
                    ? tour.date.substring(0,10)
                    : "",

                duration:
                    tour.duration || "",

                capacity:
                    tour.capacity || 20,

                maxTravelers:
                    tour.maxTravelers || 20,

                price:
                    tour.price || 0,

                discount:
                    tour.discount || 0,

                discountPrice:
                    tour.discountPrice || "",

                image:
                    tour.image || "",

                images:
                    tour.images || [],

                highlights:
                    tour.highlights || [],

                inclusions:
                    tour.inclusions || [],

                exclusions:
                    tour.exclusions || [],

                status:
                    tour.status || "upcoming",

                featured:
                    tour.featured || false,

                available:
                    tour.available ?? true


            });



        }

        catch(error){

            console.error(error);

            toast.error(
                "Failed to load tour"
            );

        }

        finally{

            setLoading(false);

        }


    };



    loadTour();


},[id]);








/*
|--------------------------------------------------------------------------
| INPUT HANDLER
|--------------------------------------------------------------------------
*/


const handleChange = (e)=>{


const {
    name,
    value,
    type,
    checked
} = e.target;



setFormData(prev=>({

    ...prev,

    [name]:
        type==="checkbox"
        ? checked
        : value

}));



};









/*
|--------------------------------------------------------------------------
| ARRAY HANDLER
|--------------------------------------------------------------------------
*/


const handleArrayChange = (
    field,
    value
)=>{


setFormData(prev=>({

    ...prev,

    [field]:

        value
        .split(",")
        .map(item=>item.trim())
        .filter(Boolean)

}));


};









/*
|--------------------------------------------------------------------------
| SUBMIT UPDATE
|--------------------------------------------------------------------------
*/


const handleSubmit = async(e)=>{


e.preventDefault();



try{


    setSaving(true);



    await updateTour(

        id,

        formData

    );



    toast.success(
        "Tour updated successfully"
    );



    navigate(
        "/admin/tours"
    );



}

catch(error){


    console.error(error);



    toast.error(

        error.response?.data?.message ||

        "Failed to update tour"

    );


}

finally{

    setSaving(false);

}



};










if(loading){


return (

<div className="p-6">

    Loading tour...

</div>

);


}









return (

<div className="max-w-5xl mx-auto p-6">


<h1 className="text-3xl font-bold mb-8">

    Edit Tour

</h1>





<form

onSubmit={handleSubmit}

className="space-y-6 bg-white shadow rounded-xl p-8"

>



<div>

<label className="block mb-2 font-semibold">

Title

</label>


<input

type="text"

name="title"

value={formData.title}

onChange={handleChange}

className="w-full border rounded-lg p-3"

/>

</div>







<div>

<label className="block mb-2 font-semibold">

Short Description

</label>


<input

type="text"

name="shortDescription"

value={formData.shortDescription}

onChange={handleChange}

className="w-full border rounded-lg p-3"

/>

</div>







<div>

<label className="block mb-2 font-semibold">

Description

</label>


<textarea

name="description"

value={formData.description}

onChange={handleChange}

rows="5"

className="w-full border rounded-lg p-3"

/>

</div>







<div className="grid md:grid-cols-2 gap-5">


<div>

<label className="block mb-2 font-semibold">

Category

</label>


<select

name="category"

value={formData.category}

onChange={handleChange}

className="w-full border rounded-lg p-3"

>

<option>Safari</option>

<option>Beach</option>

<option>Adventure</option>

<option>Cultural</option>

<option>Luxury</option>


</select>


</div>





<div>

<label className="block mb-2 font-semibold">

Status

</label>


<select

name="status"

value={formData.status}

onChange={handleChange}

className="w-full border rounded-lg p-3"

>

<option value="draft">
Draft
</option>

<option value="upcoming">
Upcoming
</option>

<option value="ongoing">
Ongoing
</option>

<option value="completed">
Completed
</option>

<option value="cancelled">
Cancelled
</option>


</select>


</div>


</div>








<div className="grid md:grid-cols-3 gap-5">


<input

type="number"

name="price"

value={formData.price}

onChange={handleChange}

placeholder="Price"

className="border rounded-lg p-3"

/>



<input

type="number"

name="capacity"

value={formData.capacity}

onChange={handleChange}

placeholder="Capacity"

className="border rounded-lg p-3"

/>




<input

type="number"

name="discount"

value={formData.discount}

onChange={handleChange}

placeholder="Discount %"

className="border rounded-lg p-3"

/>


</div>








<div className="grid md:grid-cols-2 gap-5">


<input

type="text"

name="country"

value={formData.country}

onChange={handleChange}

placeholder="Country"

className="border rounded-lg p-3"

/>



<input

type="text"

name="location"

value={formData.location}

onChange={handleChange}

placeholder="Location"

className="border rounded-lg p-3"

/>


</div>







<div>


<label className="block mb-2 font-semibold">

Tour Date

</label>


<input

type="date"

name="date"

value={formData.date}

onChange={handleChange}

className="border rounded-lg p-3"

/>


</div>








<div>

<label className="block mb-2 font-semibold">

Main Image URL

</label>


<input

type="text"

name="image"

value={formData.image}

onChange={handleChange}

className="w-full border rounded-lg p-3"

/>


</div>








<div>

<label className="block mb-2 font-semibold">

Highlights (comma separated)

</label>


<input

type="text"

value={formData.highlights.join(", ")}

onChange={(e)=>

handleArrayChange(
"highlights",
e.target.value
)

}

className="w-full border rounded-lg p-3"

/>


</div>








<div>

<label className="block mb-2 font-semibold">

Inclusions

</label>


<input

type="text"

value={formData.inclusions.join(", ")}

onChange={(e)=>

handleArrayChange(
"inclusions",
e.target.value
)

}

className="w-full border rounded-lg p-3"

/>


</div>








<div>

<label className="block mb-2 font-semibold">

Exclusions

</label>


<input

type="text"

value={formData.exclusions.join(", ")}

onChange={(e)=>

handleArrayChange(
"exclusions",
e.target.value
)

}

className="w-full border rounded-lg p-3"

/>


</div>








<div className="flex gap-6">


<label className="flex items-center gap-2">


<input

type="checkbox"

name="featured"

checked={formData.featured}

onChange={handleChange}

/>


Featured


</label>





<label className="flex items-center gap-2">


<input

type="checkbox"

name="available"

checked={formData.available}

onChange={handleChange}

/>


Available


</label>


</div>








<button

disabled={saving}

className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"

>


{
saving

?

"Updating..."

:

"Update Tour"

}


</button>





</form>


</div>

);


}