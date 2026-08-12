import React from "react";
import {
  Activity,
  Users,
  ShieldCheck,
  Database,
  CreditCard,
  Map,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

const kpis = [
  {title:"Total Users", value:"2,845", change:"+12.4%", icon:Users},
  {title:"Revenue", value:"KES 12.4M", change:"+18.2%", icon:TrendingUp},
  {title:"Active Tours", value:"126", change:"+8.1%", icon:Map},
  {title:"Security Score", value:"98%", change:"Excellent", icon:ShieldCheck},
];

const revenue = [
  {month:"Jan",amount:850000},
  {month:"Feb",amount:1200000},
  {month:"Mar",amount:980000},
  {month:"Apr",amount:1600000},
  {month:"May",amount:2100000},
  {month:"Jun",amount:2600000},
];

const tours = [
  {name:"Safari",bookings:245},
  {name:"Beach",bookings:180},
  {name:"Mountain",bookings:92},
];

function Service({icon:Icon,title,status,detail}) {
 return <div className="rounded-2xl bg-white border shadow-sm p-5 flex gap-4 items-center">
   <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700"><Icon size={24}/></div>
   <div><h3 className="font-bold">{title}</h3><p className="text-emerald-600 font-semibold">{status}</p><p className="text-sm text-gray-500">{detail}</p></div>
 </div>
}

export default function SuperAdminDashboard(){
 return <section className="space-y-8">
  <header>
   <h1 className="text-4xl font-black">Super Admin Control Center</h1>
   <p className="text-gray-500 mt-2">Enterprise platform governance, tourism intelligence and security operations.</p>
  </header>

  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
   {kpis.map(({title,value,change,icon:Icon})=>
    <div key={title} className="bg-white rounded-2xl border shadow-sm p-6">
     <div className="flex justify-between"><span className="text-gray-500">{title}</span><Icon/></div>
     <div className="text-3xl font-black mt-4">{value}</div>
     <div className="text-emerald-600 mt-2">{change}</div>
    </div>)}
  </div>

  <div className="grid xl:grid-cols-2 gap-6">
   <div className="bg-white rounded-2xl border shadow-sm p-6">
    <h2 className="font-bold text-xl mb-5">Revenue Analytics</h2>
    <ResponsiveContainer width="100%" height={280}>
     <AreaChart data={revenue}>
      <CartesianGrid strokeDasharray="3 3"/>
      <XAxis dataKey="month"/><YAxis/><Tooltip/>
      <Area dataKey="amount" type="monotone" fillOpacity={0.3}/>
     </AreaChart>
    </ResponsiveContainer>
   </div>
   <div className="bg-white rounded-2xl border shadow-sm p-6">
    <h2 className="font-bold text-xl mb-5">Tour Performance</h2>
    <ResponsiveContainer width="100%" height={280}>
     <BarChart data={tours}>
      <CartesianGrid strokeDasharray="3 3"/>
      <XAxis dataKey="name"/><YAxis/><Tooltip/>
      <Bar dataKey="bookings"/>
     </BarChart>
    </ResponsiveContainer>
   </div>
  </div>

  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
   <Service icon={Activity} title="API Services" status="ONLINE" detail="All endpoints responding"/>
   <Service icon={Database} title="Database" status="HEALTHY" detail="MongoDB operational"/>
   <Service icon={CreditCard} title="Payments" status="ACTIVE" detail="M-Pesa gateway ready"/>
   <Service icon={AlertTriangle} title="Security" status="MONITORED" detail="Audit monitoring active"/>
  </div>

  <div className="bg-white rounded-2xl border shadow-sm p-6">
   <h2 className="font-bold text-xl mb-4">Recent Platform Activity</h2>
   <div className="space-y-3 text-gray-600">
    <p>✓ New customer registrations processed</p>
    <p>✓ Booking payments verified</p>
    <p>✓ Staff permissions audited</p>
    <p>✓ System health scan completed</p>
   </div>
  </div>
 </section>
}
