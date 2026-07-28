import { Navigate, Outlet } from "react-router-dom";


export default function ProtectedAdminRoute() {


    const user = JSON.parse(
        localStorage.getItem("user")
    );


    const token = localStorage.getItem("token");



    if (
        !token ||
        !user ||
        user.role !== "admin"
    ) {

        return (

            <Navigate
                to="/admin/login"
                replace
            />

        );

    }



    return <Outlet />;

}