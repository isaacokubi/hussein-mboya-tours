// client/src/components/PermissionGuard.jsx

import {
  Navigate,
  useLocation
} from "react-router-dom";



export default function PermissionGuard({

  permission,

  children

}) {


  const location = useLocation();



  let user = null;


  try {

    user =
      JSON.parse(
        localStorage.getItem("user")
      );

  }

  catch {

    user = null;

  }






  // Not logged in

  if(!user){

    return (

      <Navigate

        to="/login"

        replace

        state={{
          from: location
        }}

      />

    );

  }







  const permissions =
    user?.permissions || [];







  const isAdmin =
    user?.role === "admin"
    ||
    user?.role === "superadmin";







  const allowed =

    isAdmin

    ||

    permissions.some(

      item =>

      item.name === permission

    );







  if(!allowed){


    return (

      <Navigate

        to="/unauthorized"

        replace

      />

    );


  }







  return children;


}