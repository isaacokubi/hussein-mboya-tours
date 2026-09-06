import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HusseinAIWidget = lazy(() => import("./components/HusseinAIWidget"));

const DASHBOARD_PREFIXES = [
  "/admin",
  "/superadmin",
  "/agent",
  "/tour-manager",
  "/guide",
  "/driver",
];

export default function App() {
  const location = useLocation();
  const isDashboard = DASHBOARD_PREFIXES.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isDashboard && <Navbar />}

      <main className="flex-1">
        <AppRoutes />
      </main>

      {!isDashboard && <Footer />}

      {!isDashboard && (
        <Suspense fallback={null}>
          <HusseinAIWidget />
        </Suspense>
      )}

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
