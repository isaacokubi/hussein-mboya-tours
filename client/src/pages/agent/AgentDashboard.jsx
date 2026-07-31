// client/src/pages/agent/AgentDashboard.jsx


import {
    CalendarDays,
    Users,
    CheckCircle,
    Wallet,
    FileText,
    UserRoundCheck,
    Map
} from "lucide-react";


import {
    useAgentDashboard
}
from "../../hooks/useAgentDashboard";


import DashboardCard
from "../../components/agent/DashboardCard";







export default function AgentDashboard(){



    const {

        data,

        isLoading,

        error

    } = useAgentDashboard();









    if(isLoading)

    return (

        <div className="
            p-8
            min-h-screen
            bg-gray-50
        ">


            <h2 className="
                text-xl
                font-semibold
                text-gray-700
            ">


                Loading Hussein Mboya Tours Agent Portal...


            </h2>



        </div>

    );









    if(error)

    return (

        <div className="
            p-8
            min-h-screen
            bg-gray-50
        ">



            <div className="
                bg-red-50
                border
                border-red-200
                rounded-xl
                p-6
                text-red-700
            ">


                Unable to load agent dashboard.
                Please try again later.


            </div>



        </div>

    );









    const stats =

        data?.stats || {};









    return (



        <div className="
            min-h-screen
            bg-gray-50
            p-6
            md:p-8
        ">









            <div className="mb-8">


                <h1 className="
                    text-4xl
                    font-bold
                    text-gray-800
                ">


                    Welcome Back, Agent


                </h1>





                <p className="
                    text-gray-600
                    mt-2
                ">


                    Manage Hussein Mboya Tours bookings, guests, safari activities and commissions.


                </p>



            </div>









            <div className="
                grid
                sm:grid-cols-2
                lg:grid-cols-4
                gap-6
            ">





                <DashboardCard


                    title="Assigned Tours"


                    value={

                        stats.assignedTours || 0

                    }


                    icon={

                        <Map size={28}/>

                    }


                    description="Active safari assignments"


                />







                <DashboardCard


                    title="Upcoming Departures"


                    value={

                        stats.upcomingTours || 0

                    }


                    icon={

                        <CalendarDays size={28}/>

                    }


                    description="Tours scheduled soon"


                />







                <DashboardCard


                    title="Total Guests"


                    value={

                        stats.totalGuests || 0

                    }


                    icon={

                        <Users size={28}/>

                    }


                    description="Guests under your management"


                />







                <DashboardCard


                    title="Completed Tours"


                    value={

                        stats.completedTours || 0

                    }


                    icon={

                        <CheckCircle size={28}/>

                    }


                    description="Successfully completed safaris"


                />





            </div>









            <div className="
                grid
                md:grid-cols-2
                gap-6
                mt-8
            ">






                <DashboardCard


                    title="Commission Earned"


                    value={

                        `KES ${

                            Number(

                                stats.totalCommission || 0

                            )

                            .toLocaleString()

                        }`

                    }


                    icon={

                        <Wallet size={28}/>

                    }


                    description="Your total safari commissions"



                    trend={

                        stats.commissionGrowth

                        ?

                        `${stats.commissionGrowth}% this month`

                        :

                        null

                    }


                />









                <DashboardCard


                    title="Wallet Balance"


                    value={

                        `KES ${

                            Number(

                                stats.walletBalance || 0

                            )

                            .toLocaleString()

                        }`

                    }



                    icon={

                        <Wallet size={28}/>

                    }



                    description="Available withdrawal balance"



                />







            </div>









            <div className="mt-10">


                <h2 className="
                    text-xl
                    font-bold
                    text-gray-800
                    mb-5
                ">


                    Quick Actions


                </h2>









                <div className="
                    grid
                    md:grid-cols-3
                    gap-6
                ">





                    <ActionCard


                        title="Manage Bookings"


                        description="View customer reservations, payments and travel schedules."

                        icon={

                            <FileText size={30}/>

                        }


                        color="green"


                    />







                    <ActionCard


                        title="Manage Guests"


                        description="View guest profiles, requirements and travel information."

                        icon={

                            <UserRoundCheck size={30}/>

                        }


                        color="blue"


                    />







                    <ActionCard


                        title="Submit Tour Report"


                        description="Complete safari reports after tour completion."

                        icon={

                            <FileText size={30}/>

                        }


                        color="orange"


                    />





                </div>





            </div>









            <div className="
                mt-10
                bg-white
                rounded-2xl
                shadow-sm
                border
                p-6
            ">



                <h2 className="
                    text-xl
                    font-bold
                    text-gray-800
                ">


                    Recent Activity


                </h2>





                <p className="
                    text-gray-500
                    mt-3
                ">


                    Recent bookings, guest updates and tour activities will appear here.


                </p>




            </div>








        </div>



    );


}









function ActionCard({

    title,

    description,

    icon,

    color

}){



    const colors = {


        green:

        "bg-green-700 hover:bg-green-800",



        blue:

        "bg-blue-700 hover:bg-blue-800",



        orange:

        "bg-orange-600 hover:bg-orange-700"


    };







    return (



        <div className="
            bg-white
            rounded-2xl
            shadow-sm
            border
            p-6
        ">



            <div className="
                text-gray-700
                mb-4
            ">


                {icon}


            </div>





            <h3 className="
                font-semibold
                text-lg
                text-gray-800
            ">


                {title}


            </h3>





            <p className="
                text-gray-600
                mt-2
                text-sm
            ">


                {description}


            </p>







            <button

                className={`
                    mt-5
                    px-5
                    py-2
                    rounded-lg
                    text-white
                    transition
                    ${colors[color]}
                `}

            >


                Open


            </button>







        </div>


    );


}