/**
 * Purpose: main client application module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { TenantProvider } from './context/TenantContext';
// Load react-dom/client so this module can use its exported dependencies.
import ReactDOM from "react-dom/client";
// Load react-router-dom so this module can use its exported dependencies.
import { BrowserRouter } from "react-router-dom";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { QueryClientProvider } from "@tanstack/react-query";
// Load ./lib/queryClient so this module can use its exported dependencies.
import { queryClient } from "./lib/queryClient";
// Load ./App so this module can use its exported dependencies.
import App from "./App";
// Load ./context/AuthContext so this module can use its exported dependencies.
import { AuthProvider } from "./context/AuthContext";
// Load ./api/apiUrls so this module can use its exported dependencies.
import { socketUrl } from "./api/apiUrls";
// Load ./context/SettingsContext so this module can use its exported dependencies.
import { SettingsProvider } from "./context/SettingsContext";
// Load ./context/CartContext so this module can use its exported dependencies.
import { CartProvider } from "./context/CartContext";
// Load ./index.css so this module can use its exported dependencies.
import "./index.css";
// Load ./utils/syncPickupTimeWithTravelDate so this module can use its exported dependencies.
import "./utils/syncPickupTimeWithTravelDate";

// Perform the side effect or state update expressed on the following line.
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

// Check the condition (import.meta.env.DEV) and run the matching branch.
if (import.meta.env.DEV) {
  // Declare apiUrl for use by the surrounding module or function.
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  // Perform the side effect or state update expressed on the following line.
  console.log("Effective API URL =", apiUrl);
  // Perform the side effect or state update expressed on the following line.
  console.log("Effective Socket URL =", socketUrl);
}
