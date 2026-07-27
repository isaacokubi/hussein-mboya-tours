import { Outlet } from "react-router-dom";

import AgentSidebar from "../components/agent/AgentSidebar";
import AgentHeader from "../components/agent/AgentHeader";


const AgentLayout = () => {


    return (

        <div className="flex min-h-screen bg-gray-100">


            {/* Sidebar */}

            <AgentSidebar />



            <div className="flex-1 flex flex-col">



                {/* Header */}

                <AgentHeader />




                {/* Page Content */}

                <main className="flex-1 p-6">


                    <Outlet />


                </main>



            </div>


        </div>


    );


};


export default AgentLayout;