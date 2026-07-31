import AppRoutes from "./routes/AppRoutes";

import Navbar from "./components/layout/Navbar";

import Footer from "./components/layout/Footer";

import HusseinAIWidget from "./components/HusseinAIWidget";


import {
  ToastContainer
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";



export default function App(){


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

<Footer />








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