import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  Wallet,
  Users,
  Car,
  Settings,
  PlusCircle,
  Edit,
  Smartphone,
  FileText,
  Home,
} from "lucide-react";

import { FaChartBar } from "react-icons/fa";

const AdminSidebar = () => {
  const menu = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin",
    },

    {
      title: "Tours",
      icon: <Map size={20} />,

      children: [
        {
          title: "Create Tour",
          icon: <PlusCircle size={18} />,
          path: "/admin/tours/add",
        },

        {
          title: "Manage Tours",
          icon: <Edit size={18} />,
          path: "/admin/tours",
        },
      ],
    },

    {
      title: "Bookings",
      icon: <CalendarCheck size={20} />,
      path: "/admin/bookings",
    },

    {
      title: "Finance",
      icon: <Wallet size={20} />,

      children: [
        {
          title: "Revenue",
          icon: <Wallet size={18} />,
          path: "/admin/finance",
        },

        {
          title: "M-Pesa Transactions",
          icon: <Smartphone size={18} />,
          path: "/admin/finance/transactions",
        },

        {
          title: "Reports",
          icon: <FileText size={18} />,
          path: "/admin/finance/reports",
        },
      ],
    },

    {
      title: "Analytics",
      icon: <FaChartBar size={20} />,
      path: "/admin/analytics",
    },

    {
      title: "Customers",
      icon: <Users size={20} />,
      path: "/admin/customers",
    },

    {
      title: "Guides",
      icon: <Users size={20} />,
      path: "/admin/guides",
    },

    {
      title: "Vehicles",
      icon: <Car size={20} />,
      path: "/admin/vehicles",
    },

    {
      title: "Settings",
      icon: <Settings size={20} />,
      path: "/admin/settings",
    },

    {
      title: "Website",
      icon: <Home size={20} />,
      path: "/",
    },
  ];

  return (
    <aside className="w-72 bg-green-900 text-white min-h-screen p-5 shadow-xl">
      <h2 className="text-2xl font-bold mb-10">
        HUSSEIN TOURS
        <br />
        <span className="text-sm text-green-300">ADMIN PANEL</span>
      </h2>

      <nav className="space-y-3">
        {menu.map((item, index) => (
          <div key={index}>
            {item.children ? (
              <div>
                <div className="flex items-center gap-3 p-3 font-semibold text-green-200">
                  {item.icon}
                  <span>{item.title}</span>
                </div>

                <div className="ml-6 space-y-2 border-l border-green-700 pl-3">
                  {item.children.map((child, i) => (
                    <NavLink
                      key={i}
                      to={child.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 p-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? "bg-green-600 text-white"
                            : "hover:bg-green-800 text-green-100"
                        }`
                      }
                    >
                      {child.icon}
                      <span>{child.title}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive ? "bg-green-600" : "hover:bg-green-800"
                  }`
                }
              >
                {item.icon}
                <span>{item.title}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
