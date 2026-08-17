import { useSettings } from "../../../context/SettingsContext";
import {
  LayoutDashboard,
  Map,
  Calendar,
  FileText,
  Users,
  UserRoundCheck,
  Car,
  Settings,
  BarChart3,
  ClipboardCheck,
  FileBarChart2,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  {
    section: "Overview",
    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={20} />,
        path: "/manager/dashboard",
      },
      {
        name: "Analytics",
        icon: <BarChart3 size={20} />,
        path: "/manager/analytics",
      },
    ],
  },

  {
    section: "Operations",
    items: [
      {
        name: "Tours",
        icon: <Map size={20} />,
        path: "/manager/tours",
      },
      {
        name: "Calendar",
        icon: <Calendar size={20} />,
        path: "/manager/calendar",
      },
      {
        name: "Bookings",
        icon: <FileText size={20} />,
        path: "/manager/bookings",
      },
      {
        name: "Tour Assignments",
        icon: <ClipboardCheck size={20} />,
        path: "/manager/assignments",
      },
    ],
  },

  {
    section: "Resources",
    items: [
      {
        name: "Customers",
        icon: <Users size={20} />,
        path: "/manager/customers",
      },
      {
        name: "Guides",
        icon: <UserRoundCheck size={20} />,
        path: "/manager/guides",
      },
      {
        name: "Vehicles",
        icon: <Car size={20} />,
        path: "/manager/vehicles",
      },
    ],
  },

  {
    section: "Administration",
    items: [
      {
        name: "Reports",
        icon: <FileBarChart2 size={20} />,
        path: "/manager/reports",
      },
      {
        name: "Settings",
        icon: <Settings size={20} />,
        path: "/manager/settings",
      },
    ],
  },
];

export default function TourManagerSidebar(
) {
  return (
    <aside className="w-72 min-h-screen bg-green-900 text-white flex flex-col shadow-xl">
      {/* Logo */}

      <div className="px-6 py-8 border-b border-green-800">
        <h2 className="text-2xl font-bold">
          {settings.companyName || 'Company'}
        </h2>

        <p className="text-green-300 text-sm mt-1">
          Tour Manager Portal
        </p>
      </div>

      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {menu.map((group) => (
          <div
            key={group.section}
            className="mb-8"
          >
            <h3 className="px-3 mb-3 text-xs uppercase tracking-wider text-green-300 font-semibold">
              {group.section}
            </h3>

            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/manager/dashboard"}
                  className={({ isActive }) =>
                    `
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-lg
                    transition-all
                    duration-200

                    ${
                      isActive
                        ? "bg-green-600 text-white shadow-lg"
                        : "text-green-100 hover:bg-green-800"
                    }
                  `
                  }
                >
                  {item.icon}

                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}

      <div className="border-t border-green-800 p-5 text-sm text-green-300">
        Tour Manager Dashboard
      </div>
    </aside>
  );
}