import AppRoutes from "./routes/AppRoutes";

import Navbar from "./components/layout/Navbar";

import Footer from "./components/layout/Footer";

import HusseinAIWidget from "./components/HusseinAIWidget";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";


export default function App() {

  return (

    <div className="min-h-screen flex flex-col">

      <Navbar />


      <main className="flex-1">

        <AppRoutes />

      </main>


      <Footer />


      {/* AI Assistant Floating Widget */}
      <HusseinAIWidget />


      <ToastContainer
        position="top-right"
        autoClose={3000}
      />

    </div>

  );

}