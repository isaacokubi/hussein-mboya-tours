import React from "react";
export default function AgentDashboard(){return <section className="p-6 space-y-6"><h1 className="text-3xl font-bold">Agent Dashboard</h1><div className="grid md:grid-cols-4 gap-4">{["Customers","Quotes","Bookings","Commissions"].map(x=><div className="bg-white shadow rounded-xl p-5" key={x}><b>{x}</b><p>Management center</p></div>)}</div></section>}
