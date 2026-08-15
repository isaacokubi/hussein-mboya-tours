import {
  Navigate
} from "react-router-dom";

import {
  useAuth
} from "../../context/AuthContext";



export default function ProtectedRoute({

  children,

  roles = [],

  permission

}) {


  const {

    user,

    token,

    loading

  } = useAuth();




  if (loading) {

    return (

      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        text-lg
        font-semibold
        "
      >

        Loading...

      </div>

    );

  }






  if (!token || !user) {


    return (

      <Navigate

        to="/login"

        replace

      />

    );


  }







  const getRoleName = () => {


    if (typeof user.role === "string") {

      return user.role;

    }



    if (user.role?.name) {

      return user.role.name;

    }

    if (user.roleId?.name) {
      return user.roleId.name;
    }



    if (

      Array.isArray(user.roles)

      &&

      user.roles.length

    ) {

      return user.roles[0]?.name;

    }



    return "";

  };








  const normalizeRole = (role) => {


    return role

      ?.toString()

      .toLowerCase()

      .replace(/[\s_-]/g, "");


  };








  const userRole = normalizeRole(

    getRoleName()

  );








  const roleMap = {


    admin: "admin",

    superadmin: "superadmin",

    administrator: "admin",


    agent: "agent",


    guide: "guide",

    tourguide: "guide",

    driver: "driver",


    manager: "manager",

    tourmanager: "manager",

    tour_manager: "manager"


  };








  const finalRole =

    roleMap[userRole]

    ||

    userRole;









  /*
  |--------------------------------------------------------------------------
  | ROLE PROTECTION
  |--------------------------------------------------------------------------
  */


  if (roles.length) {


    const allowedRoles = roles.map(

      role =>

        roleMap[normalizeRole(role)]

        ||

        normalizeRole(role)

    );





    if (!allowedRoles.includes(finalRole)) {


      switch (finalRole) {


        case "admin":

          return (

            <Navigate

              to="/admin/dashboard"

              replace

            />

          );



        case "agent":

          return (

            <Navigate

              to="/agent"

              replace

            />

          );



        case "guide":

          return (

            <Navigate

              to="/guide/dashboard"

              replace

            />

          );

        case "driver":

          return (

            <Navigate

              to="/driver/dashboard"

              replace

            />

          );



        case "manager":

          return (

            <Navigate

              to="/tour-manager/dashboard"

              replace

            />

          );



        case "superadmin":

          return (

            <Navigate

              to="/superadmin/dashboard"

              replace

            />

          );


        default:

          return (

            <Navigate

              to="/"

              replace

            />

          );


      }


    }


  }










  /*
  |--------------------------------------------------------------------------
  | PERMISSION PROTECTION
  |--------------------------------------------------------------------------
  */


  if (permission) {


    const permissions =

      user.permissions

      ||

      JSON.parse(

        localStorage.getItem("permissions")

      )

      ||

      [];






    const permissionNames = permissions.map(

      item =>

        typeof item === "string"

          ?

          item

          :

          item.name

    );





    if (

      !permissionNames.includes(permission)

    ) {


      return (

        <Navigate

          to="/unauthorized"

          replace

        />

      );


    }


  }







  return children;


}