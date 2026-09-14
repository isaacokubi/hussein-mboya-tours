import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HusseinAIWidget from "./components/HusseinAIWidget";
import AdminRoute from "./components/auth/AdminRoute";
import PlanFeatureGate from "./components/auth/PlanFeatureGate";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const WithholdingTax=lazy(()=>import("./pages/admin/finance/WithholdingTax"));
const AccountingCompletionCenter=lazy(()=>import("./pages/admin/finance/AccountingCompletionCenter"));
const AccountingControlReports=lazy(()=>import("./pages/admin/finance/AccountingControlReports"));
const AccountingSubledgers=lazy(()=>import("./pages/admin/finance/AccountingSubledgers"));
export default function App(){const location=useLocation();const withholding=location.pathname==="/admin/finance/withholding-tax";const accountingCompletion=location.pathname==="/admin/finance/accounting/completion";const accountingReports=location.pathname==="/admin/finance/accounting/control-reports";const accountingSubledgers=location.pathname==="/admin/finance/accounting/subledgers";const bareAdmin=withholding||accountingCompletion||accountingReports||accountingSubledgers;const content=withholding?<AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><WithholdingTax/></Suspense></AdminRoute>:accountingCompletion?<AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><AccountingCompletionCenter/></Suspense></AdminRoute>:accountingReports?<AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><AccountingControlReports/></Suspense></AdminRoute>:accountingSubledgers?<AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><AccountingSubledgers/></Suspense></AdminRoute>:<AppRoutes/>;return <div className="min-h-screen flex flex-col bg-gray-50">{!bareAdmin&&<Navbar/>}<main className="flex-1"><PlanFeatureGate>{content}</PlanFeatureGate></main>{!location.pathname.startsWith("/admin")&&!location.pathname.startsWith("/superadmin")&&!location.pathname.startsWith("/agent")&&!location.pathname.startsWith("/tour-manager")&&!location.pathname.startsWith("/guide")&&!location.pathname.startsWith("/driver")&&<Footer/>}<HusseinAIWidget/><ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable/></div>}
