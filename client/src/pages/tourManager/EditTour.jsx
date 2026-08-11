// client/src/pages/tourManager/EditTour.jsx


import {
    useState,
    useEffect,
    useRef
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


import { getTour, updateTour, getGuides, getDrivers, getVehicles, assignTourResources } from "../../api/tourApi";
import { getDestinations } from "../../api/destinationApi";









const EditTour =()=>{



    const {

        id

    } = useParams();




    const navigate = useNavigate();



    const queryClient = useQueryClient();



    const {
        data: vehicles = []
    } = useQuery({
        queryKey:["tour-assignment-vehicles"],
        queryFn:getVehicles
    });

    const {
        data: drivers = []
    } = useQuery({
        queryKey:["tour-assignment-drivers"],
        queryFn:getDrivers
    });





    const {
        data: guides = []
    } = useQuery({

        queryKey:[
            "tour-assignment-guides"
        ],

        queryFn:getGuides

    });





    const {
        data: destinations = []
    } = useQuery({

        queryKey:[
            "destinations"
        ],

        queryFn:getDestinations

    });



    










    const [form,setForm] = useState(null);

    const formInitialized = useRef(false);

    



    const {
        mutate: saveTour,
        isPending
    } = useMutation({

        mutationFn: async (data) => {
            const {
                assignedGuide,
                assignedDriver,
                assignedVehicle,
                ...tourFields
            } = data;

            const response = await updateTour(id, tourFields);

            await assignTourResources(id, {
                guideId: assignedGuide || null,
                driverId: assignedDriver || null,
                vehicleId: assignedVehicle || null,
            });

            return response;
        },

        onSuccess:(data)=>{

            console.log(
                "EDIT TOUR RESPONSE:",
                data
            );

            toast.success(
                "Tour updated successfully"
            );

            queryClient.invalidateQueries({
                queryKey:[
                    "tour",
                    id
                ]
            });

            setTimeout(()=>{
                navigate("/tour-manager/tours");
            },300);

        },

        onError:(error)=>{

            toast.error(
                error?.response?.data?.message ||
                "Update failed"
            );

        }

    });











    const {

        data:tourData,

        isLoading:tourLoading

    } = useQuery({



        queryKey:[

            "tour",

            id

        ],



        queryFn:()=>getTour(id),





        onError:(error)=>{



            toast.error(

                error?.response?.data?.message ||

                "Update failed"

            );


        }



    });










    useEffect(()=>{

        if(tourData && !formInitialized.current){

            console.log(
                "SETTING TOUR FORM:",
                tourData
            );


            setForm({

                ...tourData,

                images:
                    Array.isArray(tourData.images)
                    ? tourData.images.join(",")
                    : tourData.images || "",


                destination:
                    tourData.destination?._id ||
                    "",


                assignedGuide:
                    tourData.assignedGuide?._id ||
                    "",


                assignedDriver:
                    tourData.assignedDriver?._id ||
                    "",


                assignedVehicle:
                    tourData.assignedVehicle?._id ||
                    "",


                date:
                    tourData.date?.substring(0,10) ||
                    "",


                difficulty:
                    tourData.difficulty ||
                    "easy",


                status:
                    tourData.status ||
                    "upcoming",

            });

        }


    },[tourData]);


    const handleChange=(e)=>{



        setForm(prev=>({



            ...prev,



            [e.target.name]:

                e.target.value



        }));



    };









    const submitHandler = (e) => {

        e.preventDefault();


        const payload = {

            ...form,
            assignedGuide: form?.assignedGuide || null,
            assignedDriver: form?.assignedDriver || null,
            assignedVehicle: form?.assignedVehicle || null,
            capacity: Number.isFinite(Number(form?.capacity))
                ? Number(form?.capacity)
                : 0,
            duration: Number.isFinite(Number(form?.duration))
                ? Number(form?.duration)
                : 1,
            price: Number.isFinite(Number(form?.price))
                ? Number(form?.price)
                : 0,
            discount: Number.isFinite(Number(form?.discount))
                ? Number(form?.discount)
                : 0,
            images: Array.isArray(form?.images)
                ? form?.images
                : form?.images
                    ? form?.images.split(",").map(img => img.trim())
                    : []
        };


        console.log("UPDATE TOUR PAYLOAD:", payload);


        saveTour(payload);
    };

    if (tourLoading) {
        return (
            <div className="p-6">
                Loading tour...
            </div>
        );
    }

    if (!form) {
        return (
            <div className="p-10 text-center">
                Loading tour...
            </div>
        );
    }




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

                        value={form?.title || ""}

                        onChange={handleChange}

                        className="input"

                    />








                    <input

                        name="category"

                        value={form?.category || ""}

                        onChange={handleChange}

                        className="input"

                    />








                    <select

                        name="destination"

                        value={form?.destination || ""}

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

                        value={form?.country || ""}

                        onChange={handleChange}

                        className="input"

                    />









                    <textarea

                        name="description"

                        value={form?.description || ""}

                        onChange={handleChange}

                        className="
                            input
                            md:col-span-2
                        "

                    />









                    <input

                        type="date"

                        name="date"

                        value={form?.date || ""}

                        onChange={handleChange}

                        className="input"

                    />









                    <input

                        type="number"

                        name="capacity"

                        value={form?.capacity || ""}

                        onChange={handleChange}

                        className="input"

                    />









                    <input

                        type="number"

                        name="duration"

                        value={form?.duration || ""}

                        onChange={handleChange}

                        className="input"

                    />









                    <select

                        name="difficulty"

                        value={form?.difficulty || ""}

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

                        value={form?.price || ""}

                        onChange={handleChange}

                        className="input"

                    />









                    <input

                        type="number"

                        name="discount"

                        value={form?.discount || ""}

                        onChange={handleChange}

                        className="input"

                    />









                    <select

                        name="assignedGuide"

                        value={form?.assignedGuide || ""}

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

                        name="assignedVehicle"

                        value={form?.assignedVehicle || ""}

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
                        name="assignedDriver"
                        value={form?.assignedDriver || ""}
                        onChange={handleChange}
                        className="input"
                    >
                        <option value="">Driver</option>
                        {drivers.map((item) => (
                            <option key={item._id} value={item._id}>
                                {item.name}
                                {item.phone ? ` - ${item.phone}` : ""}
                            </option>
                        ))}
                    </select>

                    <select

                        name="status"

                        value={form?.status || ""}

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

                        value={form?.images || ""}

                        onChange={handleChange}

                        className="
                            input
                            md:col-span-2
                        "

                    />









                    <button

                        type="submit"

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
