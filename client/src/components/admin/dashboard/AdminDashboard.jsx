import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "../../../api/adminApi";

import DashboardHeader from "./DashboardHeader";
import StatsGrid from "./StatsGrid";
import BookingOverview from "./BookingOverview";
import PopularTours from "./PopularTours";
import RecentBookings from "./RecentBookings";
import RevenueChart from "./RevenueChart";
import UserAnalytics from "./UserAnalytics";
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
        data?.data || {};



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

                    <RevenueChart

                        revenue={
                            dashboard.revenue || 0
                        }

                    />

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




            <BookingOverview

                bookingStatus={
                    dashboard.bookingStatus || []
                }

            />





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




            <UserAnalytics

                users={
                    dashboard.userStats || []
                }

            />



            <QuickActions />



            <SystemHealth />


        </div>

    );

}