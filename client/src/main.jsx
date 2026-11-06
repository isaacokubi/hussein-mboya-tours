import { TenantProvider } from './context/TenantContext';
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { socketUrl } from "./api/apiUrls";
import { SettingsProvider } from "./context/SettingsContext";
import { CartProvider } from "./context/CartContext";
import "./index.css";
import "./utils/syncPickupTimeWithTravelDate";

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <TenantProvider><App /></TenantProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

if (import.meta.env.DEV) {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  console.log("Effective API URL =", apiUrl);
  console.log("Effective Socket URL =", socketUrl);
}
