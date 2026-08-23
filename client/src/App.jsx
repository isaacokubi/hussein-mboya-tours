import { useLocation } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";


import Navbar from "./components/layout/Navbar";

import Footer from "./components/layout/Footer";

import HusseinAIWidget from "./components/HusseinAIWidget";


import {
  ToastContainer
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";



export default function App(){

const location = useLocation();


return (


<div


className="
min-h-screen
flex
flex-col
bg-gray-50
"

>


{/* GLOBAL NAVBAR */}

<Navbar />





{/* PAGE CONTENT */}

<main

className="
flex-1
"

>

<AppRoutes />

</main>







{/* FOOTER */}


{
!location.pathname.startsWith("/admin") &&
!location.pathname.startsWith("/superadmin") &&
!location.pathname.startsWith("/agent") &&
!location.pathname.startsWith("/tour-manager") &&
!location.pathname.startsWith("/guide") &&
!location.pathname.startsWith("/driver") &&
<Footer />
}









{/* FLOATING AI ASSISTANT */}

<HusseinAIWidget />







{/* GLOBAL NOTIFICATIONS */}

<ToastContainer

position="top-right"

autoClose={3000}

hideProgressBar={false}

newestOnTop

closeOnClick

pauseOnHover

draggable

/>






</div>

);





}
