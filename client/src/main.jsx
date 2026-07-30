import React from "react";

import ReactDOM from "react-dom/client";

import {
  BrowserRouter
} from "react-router-dom";


import {
  QueryClientProvider
} from "@tanstack/react-query";


import {
  queryClient
} from "./lib/queryClient";


import {
  HelmetProvider
} from "react-helmet-async";


import {
  AuthProvider
} from "./context/AuthContext";


import {
  NotificationProvider
} from "./context/NotificationContext";


import App from "./App";


import "./index.css";


// Internationalization
import "./i18n";





ReactDOM.createRoot(
  document.getElementById("root")
)
.render(

  <React.StrictMode>


    <QueryClientProvider
      client={queryClient}
    >


      <BrowserRouter>


        <HelmetProvider>


          <AuthProvider>


            <NotificationProvider>


              <App />


            </NotificationProvider>


          </AuthProvider>


        </HelmetProvider>


      </BrowserRouter>


    </QueryClientProvider>


  </React.StrictMode>

);