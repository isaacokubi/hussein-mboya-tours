import { ArrowRight, BarChart3, CalendarCheck, Image, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { name: "Create Tour", path: "/admin/tours/add", icon: Plus, description: "Add a new tour package" },
  { name: "Manage Users", path: "/admin/users", icon: Users, description: "Review customers and users" },
  { name: "View Bookings", path: "/admin/bookings", icon: CalendarCheck, description: "Manage current bookings" },
  { name: "Homepage Content", path: "/admin/gallery", icon: Image, description: "Update site media" },
  { name: "Reports", path: "/admin/reports", icon: BarChart3, description: "Review business reports" },
];

export default function QuickActions() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
        <p className="mt-1 text-sm text-slate-500">Jump directly to the tools you use most.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {actions.map(({ name, path, icon: Icon, description }) => (
          <Link
            key={name}
            to={path}
            className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" aria-hidden="true" />
            </div>
            <p className="mt-4 font-semibold text-slate-900">{name}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
