import React, { lazy, Suspense } from "react";
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

const CHUNK_ERROR_RE = /(chunk|dynamically imported module|failed to fetch dynamically imported module|importing a module script failed)/i;
const CHUNK_RELOAD_KEY = "vite-chunk-reload-attempt";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    if (typeof window !== "undefined" && CHUNK_ERROR_RE.test(String(error?.message || error))) {
      try {
        const lastAttempt = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0);
        if (Date.now() - lastAttempt > 10_000) {
          sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
          window.location.reload();
          return null;
        }
      } catch {
        // Fall through to the recovery UI when storage is unavailable.
      }
    }
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Application render error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center text-white">
        <div>
          <h1 className="text-xl font-bold">Unable to load this page</h1>
          <p className="mt-2 text-sm text-slate-300">Please try loading the page again.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold hover:bg-emerald-500">
            Reload page
          </button>
        </div>
      </div>
    );
  }
}

export default function App() {
  const location = useLocation();
  const isDashboard = DASHBOARD_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));

  return (
    <AppErrorBoundary>
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
    </AppErrorBoundary>
  );
}
