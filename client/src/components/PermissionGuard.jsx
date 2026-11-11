/**
 * Purpose: Permission Guard reusable UI component. Main declarations: PermissionGuard.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/components/PermissionGuard.jsx

// Load react-router-dom so this module can use its exported dependencies.
import {
  Navigate,
  useLocation
} from "react-router-dom";



// Define PermissionGuard; its parameters and body implement this operation.
export default function PermissionGuard({

  permission,

  children

}) {


  // Declare location for use by the surrounding module or function.
  const location = useLocation();



  // Declare user for use by the surrounding module or function.
  let user;


  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Perform the side effect or state update expressed on the following line.
    user =
      JSON.parse(
        localStorage.getItem("user")
      );

  }

  // Handle the error raised by the preceding protected operation.
  catch {

    // Perform the side effect or state update expressed on the following line.
    user = null;

  }






  // Not logged in

  // Check the condition (!user) and run the matching branch.
  if(!user){

    // Return the expression shown below to the caller.
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







  // Declare permissions for use by the surrounding module or function.
  const permissions =
    user?.permissions || [];







  // Declare isAdmin for use by the surrounding module or function.
  const isAdmin =
    user?.role === "admin"
    ||
    user?.role === "super_admin";







  // Declare allowed for use by the surrounding module or function.
  const allowed =

    isAdmin

    ||

    permissions.some(

      item =>

      item.name === permission

    );







  // Check the condition (!allowed) and run the matching branch.
  if(!allowed){


    // Return the expression shown below to the caller.
    return (

      <Navigate

        to="/unauthorized"

        replace

      />

    );


  }







  // Return the value of children to the caller.
  return children;


}
