// client/src/pages/tourManager/EditTour.jsx


import {
    useState
} from "react";


import {
    useNavigate,
    useParams
} from "react-router-dom";


import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";


import {
    toast
} from "react-toastify";


import {

    getTour,

    updateTour,

    getGuides,

    getVehicles,

    getDestinations

}
from "../../api/adminTourApi";









const EditTour =()=>{



    const {

        id

    } = useParams();




    const navigate = useNavigate();



    const queryClient = useQueryClient();

    










    const [form,setForm] = useState(null);









    const {

        data:tourData,

        isLoading:tourLoading

    } = useQuery({



        queryKey:[

            "tour",

            id

        ],



        queryFn:()=>getTour(id),



        select:(res)=>{

            console.log("EDIT TOUR SELECT:", res);

            return res;

        },



        onError:(error)=>{



            toast.error(

                error?.response?.data?.message ||

                "Update failed"

            );


        }



    });









    const handleChange=(e)=>{



        setForm(prev=>({



            ...prev,



            [e.target.name]:

                e.target.value



        }));



    };









    const submitHandler=(e)=>{



        e.preventDefault();




        saveTour({



            ...form,



            capacity:Number(form.capacity),


            duration:Number(form.duration),


            price:Number(form.price),


            discount:Number(form.discount),




            images:


                form.images

                ?

                form.images

                .split(",")

                .map(img=>img.trim())

                :

                []



        });



    };









    if(tourLoading || !form)


    return (


        <div className="
            p-10
            text-center
        ">


            Loading tour...


        </div>


    );









    return (



        <div className="
            min-h-screen
            bg-gray-100
            p-6
        ">







            <div className="
                max-w-5xl
                mx-auto
                bg-white
                rounded-xl
                shadow
                p-8
            ">





                <h1 className="
                    text-3xl
                    font-bold
                    mb-6
                ">


                    Edit Tour


                </h1>









                <form


                    onSubmit={submitHandler}



                    className="
                        grid
                        md:grid-cols-2
                        gap-5
                    "


                >







                    <input

                        name="title"

                        value={form.title}

                        onChange={handleChange}

                        className="input"

                    />








                    <input

                        name="category"

                        value={form.category}

                        onChange={handleChange}

                        className="input"

                    />








                    <select

                        name="destination"

                        value={form.destination}

                        onChange={handleChange}

                        className="input"

                    >


                        <option value="">

                            Destination

                        </option>



                        {

                            destinations.map(item=>(


                                <option

                                key={item._id}

                                value={item._id}

                                >

                                    {item.name}

                                </option>



                            ))

                        }


                    </select>








                    <input

                        name="country"

                        value={form.country}

                        onChange={handleChange}

                        className="input"

                    />









                    <textarea

                        name="description"

                        value={form.description}

                        onChange={handleChange}

                        className="
                            input
                            md:col-span-2
                        "

                    />









                    <input

                        type="date"

                        name="date"

                        value={form.date}

                        onChange={handleChange}

                        className="input"

                    />









                    <input

                        type="number"

                        name="capacity"

                        value={form.capacity}

                        onChange={handleChange}

                        className="input"

                    />









                    <input

                        type="number"

                        name="duration"

                        value={form.duration}

                        onChange={handleChange}

                        className="input"

                    />









                    <select

                        name="difficulty"

                        value={form.difficulty}

                        onChange={handleChange}

                        className="input"

                    >


                        <option value="easy">

                            Easy

                        </option>


                        <option value="moderate">

                            Moderate

                        </option>


                        <option value="hard">

                            Hard

                        </option>


                    </select>









                    <input

                        type="number"

                        name="price"

                        value={form.price}

                        onChange={handleChange}

                        className="input"

                    />









                    <input

                        type="number"

                        name="discount"

                        value={form.discount}

                        onChange={handleChange}

                        className="input"

                    />









                    <select

                        name="guide"

                        value={form.guide}

                        onChange={handleChange}

                        className="input"

                    >


                        <option value="">

                            Guide

                        </option>




                        {

                            guides.map(item=>(


                                <option

                                key={item._id}

                                value={item._id}

                                >

                                    {item.name}

                                </option>


                            ))

                        }


                    </select>









                    <select

                        name="vehicle"

                        value={form.vehicle}

                        onChange={handleChange}

                        className="input"

                    >


                        <option value="">

                            Vehicle

                        </option>





                        {

                            vehicles.map(item=>(


                                <option

                                key={item._id}

                                value={item._id}

                                >

                                    {item.name}

                                    {" - "}

                                    {

                                    item.registration ||

                                    item.registrationNumber

                                    }


                                </option>



                            ))

                        }



                    </select>









                    <select

                        name="status"

                        value={form.status}

                        onChange={handleChange}

                        className="input"

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









                    <input

                        name="images"

                        value={form.images}

                        onChange={handleChange}

                        className="
                            input
                            md:col-span-2
                        "

                    />









                    <button

                        disabled={isPending}

                        className="
                            md:col-span-2
                            bg-orange-600
                            hover:bg-orange-700
                            disabled:opacity-50
                            text-white
                            py-3
                            rounded-lg
                            font-semibold
                        "


                    >


                        {

                            isPending

                            ?

                            "Saving..."

                            :

                            "Update Tour"


                        }


                    </button>







                </form>







            </div>







        </div>


    );


};







export default EditTour;