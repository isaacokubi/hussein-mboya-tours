import { TenantProvider } from "./context/TenantContext";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { CartProvider } from "./context/CartContext";
import { queryClient } from "./lib/queryClient";
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
  console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
  console.log("VITE_SOCKET_URL =", import.meta.env.VITE_SOCKET_URL);
}
