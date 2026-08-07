import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { createTour } from "../../api/adminTourApi";
import { getDestinations } from "../../api/adminDestinationApi";


export default function AddTour() {


    const navigate = useNavigate();

    const queryClient = useQueryClient();


    const [images, setImages] = useState([]);



    const {
        data: destinationsData = [],
        isLoading: destinationsLoading
    } = useQuery({

        queryKey: ["destinations"],

        queryFn: getDestinations

    });



    const destinations = Array.isArray(destinationsData)
        ? destinationsData
        : destinationsData?.destinations || [];




    const [form,setForm] = useState({

        title:"",
        description:"",
        destination:"",
        country:"Kenya",
        date:"",
        duration:"",
        price:"",
        category:"Safari",
        featured:false

    });





    const {
        mutate: saveTour,
        isPending: submitting

    } = useMutation({

        mutationFn:createTour,


        onSuccess:()=>{


            queryClient.invalidateQueries({

                queryKey:["tours"]

            });



            toast.success(
                "Tour created successfully"
            );


            navigate("/admin/manage-tours");


        },


        onError:(error)=>{


            toast.error(

                error?.response?.data?.message ||
                "Failed to create tour"

            );


        }

    });







    const handleChange=(e)=>{


        const {
            name,
            value,
            type,
            checked

        } = e.target;



        setForm(prev=>({

            ...prev,

            [name]:
            type==="checkbox"
            ? checked
            : value

        }));

    };







    const submit=(e)=>{


        e.preventDefault();



        const data = new FormData();



        Object.entries(form).forEach(([key,value])=>{

            data.append(
                key,
                value
            );

        });





        images.forEach(image=>{

            data.append(
                "images",
                image
            );

        });




        saveTour(data);


    };






    return (

        <div className="max-w-3xl">


            <h1 className="text-2xl font-bold mb-6">

                Add New Tour

            </h1>





            <form

                onSubmit={submit}

                className="
                    space-y-5
                    bg-white
                    p-6
                    rounded-lg
                    shadow
                "

            >



                <input

                    type="text"

                    name="title"

                    placeholder="Tour title"

                    className="w-full border rounded px-4 py-3"

                    value={form.title}

                    onChange={handleChange}

                    required

                />





                <textarea

                    name="description"

                    placeholder="Description"

                    rows="5"

                    className="w-full border rounded px-4 py-3"

                    value={form.description}

                    onChange={handleChange}

                    required

                />






                <select

                    name="destination"

                    className="w-full border rounded px-4 py-3"

                    value={form.destination}

                    onChange={handleChange}

                    required

                >

                    <option value="">

                        Select Destination

                    </option>



                    {
                        destinationsLoading && (

                            <option disabled>

                                Loading destinations...

                            </option>

                        )
                    }



                    {
                        destinations.map(destination=>(

                            <option

                                key={destination._id}

                                value={destination._id}

                            >

                                {destination.name}

                            </option>

                        ))
                    }


                </select>







                <input

                    type="text"

                    name="country"

                    placeholder="Country"

                    className="w-full border rounded px-4 py-3"

                    value={form.country}

                    onChange={handleChange}

                    required

                />







                <input

                    type="date"

                    name="date"

                    className="w-full border rounded px-4 py-3"

                    value={form.date}

                    onChange={handleChange}

                    required

                />







                <input

                    type="text"

                    name="duration"

                    placeholder="e.g. 3 Days"

                    className="w-full border rounded px-4 py-3"

                    value={form.duration}

                    onChange={handleChange}

                    required

                />







                <input

                    type="number"

                    name="price"

                    placeholder="Price"

                    className="w-full border rounded px-4 py-3"

                    value={form.price}

                    onChange={handleChange}

                    required

                />







                <select

                    name="category"

                    className="w-full border rounded px-4 py-3"

                    value={form.category}

                    onChange={handleChange}

                >

                    <option value="Safari">

                        Safari

                    </option>

                    <option value="Beach">

                        Beach

                    </option>

                    <option value="Mountain">

                        Mountain

                    </option>

                    <option value="Culture">

                        Culture

                    </option>


                </select>








                <label className="flex items-center gap-3">


                    <input

                        type="checkbox"

                        name="featured"

                        checked={form.featured}

                        onChange={handleChange}

                    />


                    Featured Tour


                </label>







                <input

                    type="file"

                    multiple

                    accept="image/*"

                    onChange={(e)=>

                        setImages(

                            Array.from(
                                e.target.files
                            )

                        )

                    }

                />





                {
                    images.length > 0 && (

                        <p className="text-sm text-gray-600">

                            {images.length} image(s) selected

                        </p>

                    )
                }







                <button

                    type="submit"

                    disabled={submitting}

                    className="
                        bg-green-600
                        hover:bg-green-700
                        text-white
                        px-8
                        py-3
                        rounded
                        font-medium
                        disabled:opacity-50
                    "

                >

                    {
                        submitting
                        ? "Saving Tour..."
                        : "Save Tour"
                    }


                </button>





            </form>



        </div>

    );


}