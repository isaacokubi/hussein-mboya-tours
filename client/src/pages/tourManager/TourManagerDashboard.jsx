import {useQuery} from "@tanstack/react-query";
import {
getDashboardStats
} from "../../api/tourManagerApi";

import StatCard from "../../components/tours/tourManager/StatCard";
import UpcomingTours from "../../components/tours/tourManager/UpcomingTours";
import BookingTable from "../../components/tours/tourManager/BookingTable";

import {
Map,
CalendarDays,
Users,
Wallet
} from "lucide-react";


export default function TourManagerDashboard(){

const {data,isLoading}=useQuery({
queryKey:["tour-manager-dashboard"],
queryFn:getDashboardStats
});


const dashboard=data?.data || {};

const stats=dashboard.stats || {};


return (

<section className="p-6 space-y-8">

<h1 className="text-3xl font-bold">
Tour Manager Dashboard
</h1>

<p className="text-gray-600">
Manage tours, bookings, guides and vehicles
</p>


<div className="grid md:grid-cols-4 gap-6">


<StatCard
title="Tours"
value={stats.totalTours || 0}
subtitle="Total tours"
icon={<Map/>}
/>


<StatCard
title="Upcoming Tours"
value={stats.upcomingTours || 0}
subtitle="Scheduled tours"
icon={<CalendarDays/>}
/>


<StatCard
title="Customers"
value={stats.totalCustomers || 0}
subtitle="Registered customers"
icon={<Users/>}
/>


<StatCard
title="Revenue"
value={`KES ${stats.revenue || 0}`}
subtitle="Completed payments"
icon={<Wallet/>}
/>


</div>


<UpcomingTours/>

<BookingTable/>


</section>

)

}
