import {
  NavLink
} from "react-router-dom";

import {
  LayoutDashboard,
  Map,
  CalendarDays,
  ClipboardList,
  Users,
  UserRoundCheck,
  BarChart3
} from "lucide-react";


export default function TourManagerSidebar() {


  const links = [

    {
      name:"Dashboard",
      path:"/tour-manager",
      icon:LayoutDashboard
    },

    {
      name:"Tours",
      path:"/tour-manager/tours",
      icon:Map
    },

    {
      name:"Calendar",
      path:"/tour-manager/calendar",
      icon:CalendarDays
    },

    {
      name:"Bookings",
      path:"/tour-manager/bookings",
      icon:ClipboardList
    },

    {
      name:"Customers",
      path:"/tour-manager/customers",
      icon:Users
    },

    {
      name:"Guides",
      path:"/tour-manager/guides",
      icon:UserRoundCheck
    },

    {
      name:"Analytics",
      path:"/tour-manager/analytics",
      icon:BarChart3
    }

  ];



  return (

    <aside className="
      w-64
      min-h-screen
      bg-gray-900
      text-white
      p-5
    ">


      <h2 className="
        text-xl
        font-bold
        mb-8
      ">
        Tour Manager
      </h2>



      <nav className="space-y-2">


        {
          links.map((link)=>{


            const Icon = link.icon;


            return (

              <NavLink

                key={link.path}

                to={link.path}

                end={link.path === "/tour-manager"}

                className={({isActive})=>

                  `
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-lg
                  transition

                  ${
                    isActive
                    ?
                    "bg-blue-600"
                    :
                    "hover:bg-gray-800"
                  }

                  `
                }

              >

                <Icon size={20}/>

                <span>
                  {link.name}
                </span>


              </NavLink>

            )


          })
        }


      </nav>


    </aside>

  );

}