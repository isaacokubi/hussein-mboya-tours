import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HusseinAIWidget from "./components/HusseinAIWidget";
import AdminRoute from "./components/auth/AdminRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const WithholdingTax=lazy(()=>import("./pages/admin/finance/WithholdingTax"));
export default function App(){const location=useLocation();const withholding=location.pathname==="/admin/finance/withholding-tax";return <div className="min-h-screen flex flex-col bg-gray-50">{!withholding&&<Navbar/>}<main className="flex-1">{withholding?<AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><WithholdingTax/></Suspense></AdminRoute>:<AppRoutes/>}</main>{!location.pathname.startsWith("/admin")&&!location.pathname.startsWith("/superadmin")&&!location.pathname.startsWith("/agent")&&!location.pathname.startsWith("/tour-manager")&&!location.pathname.startsWith("/guide")&&!location.pathname.startsWith("/driver")&&<Footer/>}<HusseinAIWidget/><ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable/></div>}
