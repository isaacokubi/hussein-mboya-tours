import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";

import {
  CartProvider,
} from "./context/CartContext";


import "./index.css";



const queryClient = new QueryClient({

  defaultOptions: {

    queries: {

      retry: 1,

      staleTime:
        5 * 60 * 1000,

      refetchOnWindowFocus:
        false,

    },

  },

});





ReactDOM.createRoot(
  document.getElementById("root")
)

.render(


  <React.StrictMode>


    <QueryClientProvider
      client={queryClient}
    >


      <BrowserRouter>


        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>


      </BrowserRouter>


    </QueryClientProvider>


  </React.StrictMode>


);