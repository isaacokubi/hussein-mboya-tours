// client/src/pages/tourManager/CreateTour.jsx


import {
    useState
} from "react";


import {
    useNavigate
} from "react-router-dom";


import {
    useQuery,
    useMutation
} from "@tanstack/react-query";


import {
    toast
} from "react-toastify";


import {

    createTour,

    getGuides,

    getVehicles,

    getDestinations

}
from "../../api/tourApi";









const CreateTour =()=>{



    const navigate = useNavigate();







    const [form,setForm] = useState({


        title:"",

        description:"",

        category:"",

        destination:"",

        country:"Kenya",

        date:"",

        capacity:20,

        duration:1,

        difficulty:"easy",

        price:0,

        discount:0,

        images:"",

        guide:"",

        vehicle:"",

        status:"upcoming"


    });









    const {

        data:guidesData

    } = useQuery({



        queryKey:[

            "guides"

        ],



        queryFn:getGuides



    });









    const {

        data:vehiclesData

    } = useQuery({



        queryKey:[

            "vehicles"

        ],



        queryFn:getVehicles



    });









    const {

        data:destinationsData

    } = useQuery({



        queryKey:[

            "destinations"

        ],



        queryFn:getDestinations



    });









    const guides =

        guidesData?.users ||

        guidesData?.data?.users ||

        [];








    const vehicles =

        vehiclesData?.vehicles ||

        vehiclesData?.data?.vehicles ||

        [];








    const destinations =

        destinationsData?.destinations ||

        destinationsData?.data?.destinations ||

        [];









    const {

        mutate:saveTour,

        isPending

    } = useMutation({



        mutationFn:(payload)=>

            createTour(payload),





        onSuccess:()=>{



            toast.success(

                "Tour created successfully"

            );



            navigate(

                "/tour-manager/tours"

            );



        },



        onError:(error)=>{



            toast.error(

                error?.response?.data?.message ||

                "Tour creation failed"

            );


        }



    });









    const handleChange=(e)=>{



        const {

            name,

            value

        } = e.target;





        setForm(prev=>({

            ...prev,


            [name]:value


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


                    Create New Tour


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

                    placeholder="Tour title"

                    className="input"

                    required

                />









                <input

                    name="category"

                    value={form.category}

                    onChange={handleChange}

                    placeholder="Category"

                    className="input"

                />









                <select


                    name="destination"


                    value={form.destination}


                    onChange={handleChange}


                    className="input"


                    required


                >



                    <option value="">


                        Select Destination


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

                    placeholder="Country"

                    className="input"

                />









                <textarea


                    name="description"


                    value={form.description}


                    onChange={handleChange}


                    placeholder="Description"


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


                    placeholder="Capacity"


                    className="input"


                />









                <input


                    type="number"


                    name="duration"


                    value={form.duration}


                    onChange={handleChange}


                    placeholder="Duration days"


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


                    placeholder="Price"


                    className="input"


                />









                <input


                    type="number"


                    name="discount"


                    value={form.discount}


                    onChange={handleChange}


                    placeholder="Discount"


                    className="input"


                />









                <select


                    name="guide"


                    value={form.guide}


                    onChange={handleChange}


                    className="input"


                >



                    <option value="">


                        Assign Guide


                    </option>





                    {

                        guides.map(guide=>(


                            <option

                            key={guide._id}

                            value={guide._id}

                            >


                                {guide.name}


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


                        Assign Vehicle


                    </option>





                    {

                        vehicles.map(vehicle=>(


                            <option

                            key={vehicle._id}

                            value={vehicle._id}

                            >


                                {vehicle.name}

                                {" - "}

                                {

                                vehicle.registration ||

                                vehicle.registrationNumber

                                }


                            </option>



                        ))

                    }





                </select>









                <input


                    name="images"


                    value={form.images}


                    onChange={handleChange}


                    placeholder="Image URLs separated by comma"


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

                        "Creating..."

                        :

                        "Create Tour"


                    }



                </button>







                </form>







            </div>







        </div>


    );


};







export default CreateTour;