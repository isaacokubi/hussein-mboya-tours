// client/src/pages/admin/Vehicles.jsx


import {
    useState
} from "react";


import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";


import {
    toast
} from "react-toastify";


import {

    getVehicles,

    deleteVehicle,

    assignDriver,
    getDrivers

}
from "../../api/vehicleApi";


import AddVehicleModal
from "../../components/admin/AddVehicleModal";


import {

    Car,

    Users,

    CheckCircle,

    Wrench

}
from "lucide-react";







export default function Vehicles(){



    const queryClient = useQueryClient();




    const [
        showAdd,
        setShowAdd
    ] = useState(false);









    const {

        data,

        isLoading

    } = useQuery({


        queryKey:[

            "vehicles"

        ],



        queryFn:getVehicles


    });








    const vehicles =

        Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.vehicles)
                ? data.vehicles
                : [];

    const { data: driversData } = useQuery({
        queryKey: ["admin-vehicle-drivers"],
        queryFn: getDrivers,
    });

    const drivers =
        Array.isArray(driversData?.data)
            ? driversData.data
            : Array.isArray(driversData?.drivers)
                ? driversData.drivers
                : [];









    const {

        mutate:removeVehicle

    } = useMutation({



        mutationFn:deleteVehicle,



        onSuccess:()=>{


            queryClient.invalidateQueries({

                queryKey:[

                    "vehicles"

                ]

            });



            toast.success(

                "Vehicle removed"

            );


        }



    });








    const {

        mutate:assign

    } = useMutation({



        mutationFn:({

            vehicleId,

            driverId

        })=>

            assignDriver(

                vehicleId,

                driverId

            ),



        onSuccess:()=>{


            queryClient.invalidateQueries({

                queryKey:[

                    "vehicles"

                ]

            });



            toast.success(

                "Driver assigned"

            );


        }



    });









    const handleAssignDriver=(vehicleId)=>{
        const driverName = window.prompt(
            `Enter driver name (available: ${drivers.map(d=>d.name).join(", ") || "none"})`
        );
        if(!driverName) return;
        const driver = drivers.find(d => String(d.name || "").toLowerCase() === driverName.trim().toLowerCase());
        if(!driver){
            toast.error("Driver not found. Use the exact seeded driver name shown in the prompt.");
            return;
        }
        assign({ vehicleId, driverId: driver._id });
    };

    const remove=(id)=>{


        if(

            !window.confirm(

                "Remove this vehicle?"

            )

        )

        return;



        removeVehicle(id);


    };









    const stats={



        total:

            vehicles.length,




        available:

            vehicles.filter(

                v=>

                String(v.status || "").toLowerCase()==="available"

            ).length,





        assigned:

            vehicles.filter(

                v=>

                String(v.status || "").toLowerCase()==="assigned"

            ).length,





        maintenance:

            vehicles.filter(

                v=>

                String(v.status || "").toLowerCase()==="maintenance"

            ).length



    };









    if(isLoading)

    return (

        <div className="p-10">

            Loading vehicles...

        </div>

    );









    return (


        <div className="p-6">







            <h1 className="
                text-3xl
                font-bold
                mb-6
            ">


                Vehicle Management


            </h1>









            <button


                onClick={()=>setShowAdd(true)}



                className="
                    bg-green-700
                    text-white
                    px-5
                    py-3
                    rounded-lg
                    mb-5
                "


            >


                + Add Vehicle


            </button>









            <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-4
                gap-5
                mb-10
            ">




                <Card

                    title="Total Vehicles"

                    value={stats.total}

                    icon={<Car/>}

                />





                <Card

                    title="Available"

                    value={stats.available}

                    icon={<CheckCircle/>}

                />





                <Card

                    title="Assigned"

                    value={stats.assigned}

                    icon={<Users/>}

                />





                <Card

                    title="Maintenance"

                    value={stats.maintenance}

                    icon={<Wrench/>}

                />





            </div>









            <div className="
                bg-white
                rounded-xl
                shadow
                overflow-hidden
            ">




                <table className="w-full">


                    <thead className="bg-gray-100">


                        <tr>


                            <th className="p-4">

                                Image

                            </th>


                            <th className="p-4 text-left">

                                Name

                            </th>


                            <th className="p-4 text-left">

                                Registration

                            </th>


                            <th className="p-4 text-left">

                                Type

                            </th>


                            <th className="p-4 text-left">

                                Capacity

                            </th>


                            <th className="p-4 text-left">

                                Driver

                            </th>


                            <th className="p-4 text-left">

                                Status

                            </th>


                            <th className="p-4">

                                Actions

                            </th>


                        </tr>


                    </thead>









                    <tbody>




                    {

                    vehicles.length === 0 ? (


                        <tr>

                            <td

                            colSpan="8"

                            className="
                                p-6
                                text-center
                                text-gray-500
                            "

                            >

                                No vehicles found

                            </td>


                        </tr>



                    ) : (



                    vehicles.map(vehicle=>(


                        <tr

                        key={vehicle._id}

                        className="border-b"

                        >




                            <td className="p-4">


                                <img


                                    src={

                                        vehicle.image?.url ||

                                        "/vehicle-placeholder.png"

                                    }



                                    alt={vehicle.name}



                                    className="
                                        w-16
                                        h-16
                                        object-cover
                                        rounded
                                    "


                                />


                            </td>







                            <td className="p-4">

                                {vehicle.name}

                            </td>







                            <td className="p-4">

                                {vehicle.registrationNumber}

                            </td>







                            <td className="p-4">

                                {vehicle.type}

                            </td>







                            <td className="p-4">

                                {vehicle.capacity}

                            </td>







                            <td className="p-4">


                                {
                                    vehicle.driver?.name ||

                                    "No driver"
                                }


                            </td>







                            <td className="p-4">


                                <span className="
                                    px-3
                                    py-1
                                    rounded-full
                                    text-sm
                                    bg-green-100
                                ">


                                    {
                                        vehicle.status
                                    }


                                </span>


                            </td>







                            <td className="p-4 space-x-2">





                                <button


                                    onClick={()=>handleAssignDriver(vehicle._id)}



                                    className="
                                        bg-blue-600
                                        text-white
                                        px-3
                                        py-1
                                        rounded
                                    "


                                >


                                    Assign Driver


                                </button>







                                <button


                                    onClick={()=>remove(vehicle._id)}



                                    className="
                                        bg-red-600
                                        text-white
                                        px-3
                                        py-1
                                        rounded
                                    "


                                >


                                    Delete


                                </button>





                            </td>







                        </tr>



                    ))

                    )

                    }





                    </tbody>




                </table>




            </div>









            {

                showAdd &&


                <AddVehicleModal


                    close={()=>setShowAdd(false)}


                    refresh={()=>


                        queryClient.invalidateQueries({

                            queryKey:[

                                "vehicles"

                            ]

                        })

                    }


                />


            }







        </div>


    );


}









function Card({

    title,

    value,

    icon

}){


    return (


        <div className="
            bg-white
            shadow
            rounded-xl
            p-5
            flex
            justify-between
            items-center
        ">


            <div>


                <p className="
                    text-gray-500
                ">

                    {title}

                </p>




                <h2 className="
                    text-3xl
                    font-bold
                ">

                    {value}

                </h2>



            </div>





            <div>

                {icon}

            </div>





        </div>


    );


}