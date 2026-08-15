import { useEffect, useState } from "react";

import HusseinAIWidget from "../../components/HusseinAIWidget";
import AIAnalyticsCharts from "../../components/admin/AIAnalyticsCharts";
import AIOperationsCopilot from "../../components/admin/AIOperationsCopilot";
import AICustomerSupport from "../../components/admin/AICustomerSupport";
import AIRevenueAdvisor from "../../components/admin/AIRevenueAdvisor";

import {
  getAIDashboard,
  getAIBriefing,
  getAIAnalytics,
  getAIIntelligence,
  getAIRevenueAdvice
} from "../../api/adminAIApi";


export default function AdminAITools(){

  const [dashboard,setDashboard]=useState({});
  const [briefing,setBriefing]=useState({});
  const [analytics,setAnalytics]=useState({});
  const [intelligence,setIntelligence]=useState({});
  const [revenueAdvice,setRevenueAdvice]=useState({});


  useEffect(()=>{

    const load = async()=>{

      try{

        const results = await Promise.allSettled([
          getAIDashboard(),
          getAIBriefing(),
          getAIAnalytics(),
          getAIIntelligence(),
          getAIRevenueAdvice()
        ]);

        const [
          dashboardRes,
          briefingRes,
          analyticsRes,
          intelligenceRes,
          revenueAdviceRes
        ] = results;


        setDashboard(
          dashboardRes.status === "fulfilled"
            ? dashboardRes.value.data || {}
            : {}
        );

        setBriefing(
          briefingRes.status === "fulfilled"
            ? briefingRes.value.data || {}
            : {}
        );

        setAnalytics(
          analyticsRes.status === "fulfilled"
            ? analyticsRes.value.data || {}
            : {}
        );

        setIntelligence(
          intelligenceRes.status === "fulfilled"
            ? intelligenceRes.value.data || {}
            : {}
        );

        setRevenueAdvice(
          revenueAdviceRes.status === "fulfilled"
            ? revenueAdviceRes.value.data || {}
            : {}
        );


      }catch(error){

        console.error(
          "AI dashboard loading failed",
          error
        );

      }

    };


    load();

  },[]);



  return (

    <div className="p-6 space-y-8">


      <div>

        <h1 className="text-3xl font-bold">
          AI Control Center
        </h1>

        <p className="text-gray-600">
          Intelligent business assistant for operations,
          analytics and customer management.
        </p>

      </div>



      <div className="grid md:grid-cols-4 gap-4">


        <Card
          title="Bookings"
          value={dashboard.bookings || 0}
        />


        <Card
          title="Revenue"
          value={`KES ${dashboard.revenue || 0}`}
        />


        <Card
          title="Customers"
          value={dashboard.customers || 0}
        />


        <Card
          title="Vehicles"
          value={dashboard.vehicles || 0}
        />

      </div>



      <section className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-3">
          AI Business Intelligence
        </h2>


        <div className="grid md:grid-cols-3 gap-4">


          <Card
            title="Conversion Rate"
            value={`${intelligence.conversionRate || 0}%`}
          />


          <Card
            title="Failed Payments"
            value={intelligence.failedPayments || 0}
          />


          <Card
            title="Customer Rating"
            value={`${intelligence.customerRating || 0}/5`}
          />


          <Card
            title="Average Booking"
            value={`KES ${Math.round(intelligence.averageBookingValue || 0)}`}
          />


          <Card
            title="Top Tour"
            value={intelligence.topTour || "No data"}
          />


          <Card
            title="Total Tours"
            value={intelligence.totalTours || 0}
          />


        </div>


      </section>



      <section className="bg-white rounded-xl shadow p-6">

        <h2 className="font-bold text-xl mb-3">
          Daily AI Briefing
        </h2>


        <p>
          {briefing.summary || "No briefing available"}
        </p>


        <ul className="mt-4 list-disc ml-5">

          {(briefing.recommendations || [])
            .map((item,index)=>(

              <li key={index}>
                {item}
              </li>

            ))}

        </ul>


      </section>



      <section>

        <h2 className="text-xl font-bold mb-3">
          AI Analytics
        </h2>

        <AIAnalyticsCharts
          analytics={analytics}
        />

      </section>


      <section>

        <AIOperationsCopilot />

      </section>


      <section>

        <AICustomerSupport />

      </section>


      <section>

        <AIRevenueAdvisor
          data={revenueAdvice}
        />

      </section>


      <section>

        <h2 className="text-xl font-bold mb-3">
          Customer AI Assistant
        </h2>

        <HusseinAIWidget />

      </section>


    </div>

  );

}



function Card({title,value}){

  return (

    <div className="bg-white rounded-xl shadow p-5">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <p className="text-2xl font-bold mt-2">
        {value}
      </p>

    </div>

  );

}
