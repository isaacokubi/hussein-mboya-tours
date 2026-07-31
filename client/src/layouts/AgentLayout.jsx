import { Outlet } from "react-router-dom";

import AgentSidebar from "../components/agent/AgentSidebar";
import AgentHeader from "../components/agent/AgentHeader";


const AgentLayout = () => {


    return (

        <div className="
            flex
            min-h-screen
            bg-gray-100
            overflow-hidden
        ">


            {/* Sidebar */}

            <aside className="
                w-64
                flex-shrink-0
            ">

                <AgentSidebar />

            </aside>




            {/* Main Area */}

            <div className="
                flex-1
                flex
                flex-col
                min-w-0
            ">



                {/* Header */}

                <header>

                    <AgentHeader />

                </header>





                {/* Page Content */}

                <main className="
                    flex-1
                    overflow-y-auto
                    p-6
                ">


                    <Outlet />


                </main>



            </div>



        </div>

    );


};


export default AgentLayout;