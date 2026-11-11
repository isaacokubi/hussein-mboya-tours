/**
 * Purpose: App client application module. Main declarations: App.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { lazy, Suspense } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { useLocation } from "react-router-dom";
// Load ./routes/AppRoutes so this module can use its exported dependencies.
import AppRoutes from "./routes/AppRoutes";
// Load ./components/layout/Navbar so this module can use its exported dependencies.
import Navbar from "./components/layout/Navbar";
// Load ./components/layout/Footer so this module can use its exported dependencies.
import Footer from "./components/layout/Footer";
// Load ./components/HusseinAIWidget so this module can use its exported dependencies.
import HusseinAIWidget from "./components/HusseinAIWidget";
// Load ./components/auth/AdminRoute so this module can use its exported dependencies.
import AdminRoute from "./components/auth/AdminRoute";
// Load ./components/auth/PlanFeatureGate so this module can use its exported dependencies.
import PlanFeatureGate from "./components/auth/PlanFeatureGate";
// Load react-toastify so this module can use its exported dependencies.
import { ToastContainer } from "react-toastify";
// Load react-toastify/dist/ReactToastify.css so this module can use its exported dependencies.
import "react-toastify/dist/ReactToastify.css";
// Declare WithholdingTax for use by the surrounding module or function.
const WithholdingTax=lazy(()=>import("./pages/admin/finance/WithholdingTax"));
// Declare AccountingCompletionCenter for use by the surrounding module or function.
const AccountingCompletionCenter=lazy(()=>import("./pages/admin/finance/AccountingCompletionCenter"));
// Declare AccountingControlReports for use by the surrounding module or function.
const AccountingControlReports=lazy(()=>import("./pages/admin/finance/AccountingControlReports"));
// Declare AccountingSubledgers for use by the surrounding module or function.
const AccountingSubledgers=lazy(()=>import("./pages/admin/finance/AccountingSubledgers"));
// Define App; its parameters and body implement this operation.
export default function App(){const location=useLocation();const withholding=location.pathname==="/admin/finance/withholding-tax";const accountingCompletion=location.pathname==="/admin/finance/accounting/completion";const accountingReports=location.pathname==="/admin/finance/accounting/control-reports";const accountingSubledgers=location.pathname==="/admin/finance/accounting/subledgers";const bareAdmin=withholding||accountingCompletion||accountingReports||accountingSubledgers;const content=withholding?<AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><WithholdingTax/></Suspense></AdminRoute>:accountingCompletion?<AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><AccountingCompletionCenter/></Suspense></AdminRoute>:accountingReports?<AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><AccountingControlReports/></Suspense></AdminRoute>:accountingSubledgers?<AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><AccountingSubledgers/></Suspense></AdminRoute>:<AppRoutes/>;return <div className="min-h-screen flex flex-col bg-gray-50">{!bareAdmin&&<Navbar/>}<main className="flex-1"><PlanFeatureGate>{content}</PlanFeatureGate></main>{!location.pathname.startsWith("/admin")&&!location.pathname.startsWith("/superadmin")&&!location.pathname.startsWith("/agent")&&!location.pathname.startsWith("/tour-manager")&&!location.pathname.startsWith("/guide")&&!location.pathname.startsWith("/driver")&&<Footer/>}<HusseinAIWidget/><ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable/></div>}
