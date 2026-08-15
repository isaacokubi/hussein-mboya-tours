import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "../../../api/adminApi";

import DashboardHeader from "./DashboardHeader";
import StatsGrid from "./StatsGrid";
import PopularTours from "./PopularTours";
import RecentBookings from "./RecentBookings";
import PaymentAnalytics from "./PaymentAnalytics";
import QuickActions from "./QuickActions";
import SystemHealth from "./SystemHealth";


export default function AdminDashboard() {


    const {
        data,
        isLoading,
        isError,
        error

    } = useQuery({

        queryKey:[
            "admin-dashboard"
        ],

        queryFn:getDashboard

    });



    if(isLoading){

        return (

            <div className="p-8">

                Loading admin dashboard...

            </div>

        );

    }



    if(isError){

        return (

            <div className="p-8 text-red-600">

                Failed to load dashboard:
                {" "}
                {error?.message}

            </div>

        );

    }



    const dashboard =
        data?.data || data || {};

    console.log("ADMIN DASHBOARD RAW:", JSON.stringify(data, null, 2));
    console.log("ADMIN DASHBOARD PARSED:", JSON.stringify(dashboard, null, 2));



    return (

        <div
            className="
                p-6
                space-y-8
                bg-gray-50
                min-h-screen
            "
        >


            <DashboardHeader />



            <StatsGrid
                stats={dashboard}
            />



            <div
                className="
                    grid
                    xl:grid-cols-3
                    gap-6
                "
            >


                <div
                    className="
                        xl:col-span-2
                    "
                >

                    

                </div>




                <PaymentAnalytics

                    payments={
                        dashboard.paymentStats || {
                            completed:0,
                            pending:0,
                            failed:0
                        }
                    }

                />


            </div>




            





            <div
                className="
                    grid
                    lg:grid-cols-2
                    gap-6
                "
            >


                <PopularTours

                    tours={
                        dashboard.popularTours || []
                    }

                />



                <RecentBookings

                    bookings={
                        dashboard.recentBookings || []
                    }

                />


            </div>




            



            <QuickActions />



            <SystemHealth />


        </div>

    );

}