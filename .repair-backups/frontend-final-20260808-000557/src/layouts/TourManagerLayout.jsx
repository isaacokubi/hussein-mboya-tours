import { useEffect, useState } from "react";

import {
    Menu,
    X
} from "lucide-react";


import {
    Outlet,
    useLocation
} from "react-router-dom";


import TourManagerSidebar 
from "../components/tourManager/TourManagerSidebar";



const TourManagerLayout = () => {


    const [mobileOpen,setMobileOpen] = useState(false);


    const location = useLocation();



    // Close sidebar after navigation

    useEffect(()=>{

        setMobileOpen(false);

    },[location]);



    return (


        <div className="
            min-h-screen
            bg-gray-100
            flex
            overflow-hidden
        ">




            {/* ===============================
                DESKTOP SIDEBAR
            =============================== */}


            <aside
            className="
                hidden
                lg:block
                w-72
                flex-shrink-0
            "
            >

                <TourManagerSidebar />

            </aside>








            {/* ===============================
                MOBILE SIDEBAR
            =============================== */}



            {
                mobileOpen && (


                    <div
                    className="
                        fixed
                        inset-0
                        z-50
                        lg:hidden
                    "
                    >



                        {/* Overlay */}


                        <div

                        className="
                            absolute
                            inset-0
                            bg-black/50
                        "

                        onClick={()=>setMobileOpen(false)}

                        />






                        {/* Drawer */}


                        <aside

                        className="
                            relative
                            w-72
                            h-full
                            bg-white
                        "

                        >


                            <TourManagerSidebar />





                            <button

                            onClick={()=>setMobileOpen(false)}

                            className="
                                absolute
                                top-4
                                right-4
                                bg-white
                                text-green-900
                                p-2
                                rounded-full
                                shadow
                            "

                            >

                                <X size={22}/>

                            </button>



                        </aside>



                    </div>


                )
            }









            {/* ===============================
                MAIN SECTION
            =============================== */}



            <div
            className="
                flex-1
                flex
                flex-col
                min-w-0
            "
            >







                {/* MOBILE HEADER */}


                <header

                className="
                    lg:hidden
                    flex
                    items-center
                    gap-4
                    bg-green-900
                    p-4
                "

                >



                    <button

                    onClick={()=>setMobileOpen(true)}

                    className="
                        p-3
                        bg-green-700
                        text-white
                        rounded
                    "

                    >

                        <Menu size={25}/>

                    </button>






                    <h1

                    className="
                        text-white
                        text-xl
                        font-bold
                    "

                    >

                        Dashboard

                    </h1>



                </header>









                {/* CONTENT */}


                <main

                className="
                    flex-1
                    overflow-y-auto
                    p-6
                "

                >


                    <Outlet />


                </main>






            </div>




        </div>


    );


};



export default TourManagerLayout;