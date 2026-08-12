import React from "react";
export default function TourManagerDashboard(){return <section className="p-6 space-y-6"><h1 className="text-3xl font-bold">Tour Manager Dashboard</h1><div className="grid md:grid-cols-4 gap-4">{["Tours","Bookings","Guides","Vehicles"].map(x=><div className="bg-white shadow rounded-xl p-5" key={x}><b>{x}</b><p>Operational control</p></div>)}</div></section>}
