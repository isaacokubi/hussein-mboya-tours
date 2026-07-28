// server.js

import express from "express";

import cors from "cors";

import helmet from "helmet";

import morgan from "morgan";

import rateLimit from "express-rate-limit";

import cookieParser from "cookie-parser";

import compression from "compression";

import http from "http";

import { Server } from "socket.io";


import connectDatabase from "./config/database.js";

import env from "./config/env.js";



// ============================================================
// SOCKET MANAGER
// ============================================================

import {
  registerSocket,
  removeSocket,
  getUserIdBySocketId
} from "./socket/socketManager.js";




// ============================================================
// REGISTER MODELS
// ============================================================

import "./models/Permission.js";

import "./models/Role.js";




// ============================================================
// ROUTES
// ============================================================


// AUTH

import authRoutes from "./routes/authRoutes.js";



// PUBLIC

import tourRoutes from "./routes/tourRoutes.js";

import guideRoutes from "./routes/guideRoutes.js";

import tourAssignmentRoutes from "./routes/tourAssignmentRoutes.js";

import destinationRoutes from "./routes/destinationRoutes.js";




// BOOKINGS

import bookingRoutes from "./routes/bookingRoutes.js";




// PAYMENTS

import mpesaRoutes from "./routes/mpesaRoutes.js";




// CUSTOMER

import invoiceRoutes from "./routes/invoiceRoutes.js";

import wishListRoutes from "./routes/wishlistRoutes.js";

import reviewRoutes from "./routes/reviewRoutes.js";

import customerRoutes from "./routes/customerRoutes.js";




// USER

import userRoutes from "./routes/userRoutes.js";




// ============================================================
// ADMIN ROUTES
// ============================================================

import adminAuthRoutes from "./routes/adminAuthRoutes.js";

import adminRoutes from "./routes/adminRoutes.js";

import adminTourRoutes from "./routes/adminTourRoutes.js";

import adminDestinationRoutes from "./routes/adminDestinationRoutes.js";

import tourReportRoutes from "./routes/tourReportRoutes.js";

import financeRoutes from "./routes/financeRoutes.js";

import bookingAdminRoutes from "./routes/bookingAdminRoutes.js";




// ============================================================
// AGENT ROUTES
// ============================================================

import agentRoutes from "./routes/agentRoutes.js";

import agentCustomerRoutes from "./routes/agentCustomerRoutes.js";

import agentPackageRoutes from "./routes/agentPackageRoutes.js";




// ============================================================
// TOUR MANAGER
// ============================================================

import tourManagerRoutes from "./routes/tourManagerRoutes.js";




// ============================================================
// VEHICLES
// ============================================================

import vehicleRoutes from "./routes/vehicleRoutes.js";




// ============================================================
// OTHER
// ============================================================

import notificationRoutes from "./routes/notificationRoutes.js";

import aiRoutes from "./routes/aiRoutes.js";

import recommendationRoutes from "./routes/recommendationRoutes.js";

import analyticsRoutes from "./routes/analyticsRoutes.js";




// ============================================================
// MIDDLEWARE
// ============================================================

import securityMonitor from "./middleware/securityMonitor.js";

import notFound from "./middleware/notFoundMiddleware.js";

import errorHandler from "./middleware/errorMiddleware.js";




// ============================================================
// EXPRESS APP
// ============================================================

const app = express();




// ============================================================
// DATABASE
// ============================================================

connectDatabase();// ============================================================
// SECURITY
// ============================================================

app.use(
  helmet({
    crossOriginResourcePolicy:false
  })
);


app.use(compression());




// ============================================================
// CORS
// ============================================================


const allowedOrigins = [

  "http://localhost:5173",

  "http://localhost:3000",

  "https://hussein-mboya-tours.vercel.app"

];



app.use(
  cors({

    origin:(origin,callback)=>{


      if(!origin){

        return callback(null,true);

      }



      if(
        allowedOrigins.includes(origin)
      ){

        return callback(null,true);

      }



      return callback(
        new Error("CORS blocked")
      );


    },


    credentials:true


  })
);





// ============================================================
// BODY PARSER
// ============================================================


app.use(
  express.json({

    limit:"10mb"

  })
);



app.use(
  express.urlencoded({

    extended:true,

    limit:"10mb"

  })
);



app.use(cookieParser());




// ============================================================
// LOGGING
// ============================================================


app.use(
  morgan("dev")
);




// ============================================================
// RATE LIMIT
// ============================================================


app.use(
  securityMonitor
);



app.use(
  rateLimit({

    windowMs:
    15 * 60 * 1000,


    max:200,


    message:
    "Too many requests. Please try again later"


  })
);




// ============================================================
// HEALTH CHECK
// ============================================================


app.get(
  "/api",

  (req,res)=>{


    res.status(200).json({

      success:true,

      message:
      "Hussein Mboya Tours API Running"

    });


  }

);





// ============================================================
// PUBLIC API ROUTES
// ============================================================


app.use(
  "/api/auth",
  authRoutes
);



app.use(
  "/api/guide",
  guideRoutes
);



app.use(
  "/api/tours",
  tourRoutes
);



app.use(
  "/api/tours",
  tourAssignmentRoutes
);



app.use(
  "/api/destinations",
  destinationRoutes
);



app.use(
  "/api/bookings",
  bookingRoutes
);



app.use(
  "/api/mpesa",
  mpesaRoutes
);




// ============================================================
// CUSTOMER API ROUTES
// ============================================================


app.use(
  "/api/invoices",
  invoiceRoutes
);



app.use(
  "/api/wishlist",
  wishListRoutes
);



app.use(
  "/api/reviews",
  reviewRoutes
);



app.use(
  "/api/customers",
  customerRoutes
);




// ============================================================
// USER API ROUTES
// ============================================================


app.use(
  "/api/users",
  userRoutes
);



app.use(
  "/api/analytics",
  analyticsRoutes
);




// ============================================================
// ADMIN ROUTES
// ============================================================


app.use(
  "/api/admin/auth",
  adminAuthRoutes
);



app.use(
  "/api/admin",
  adminRoutes
);



app.use(
  "/api/admin/tours",
  adminTourRoutes
);



app.use(
  "/api/admin/bookings",
  bookingAdminRoutes
);



app.use(
  "/api/admin/destinations",
  adminDestinationRoutes
);



app.use(
  "/api/tour-reports",
  tourReportRoutes
);




// ============================================================
// FINANCE ROUTES
// ============================================================


app.use(
  "/api/admin/finance",
  financeRoutes
);




// ============================================================
// AGENT ROUTES
// ============================================================


app.use(
  "/api/agents",
  agentRoutes
);



app.use(
  "/api/agents/customers",
  agentCustomerRoutes
);



app.use(
  "/api/agents/packages",
  agentPackageRoutes
);




// ============================================================
// TOUR MANAGER ROUTES
// ============================================================


app.use(
  "/api/tourmanager",
  tourManagerRoutes
);




// ============================================================
// VEHICLE ROUTES
// ============================================================


app.use(
  "/api/vehicles",
  vehicleRoutes
);




// ============================================================
// NOTIFICATIONS
// ============================================================


app.use(
  "/api/notifications",
  notificationRoutes
);




// ============================================================
// AI
// ============================================================


app.use(
  "/api/ai",
  aiRoutes
);




// ============================================================
// RECOMMENDATIONS
// ============================================================


app.use(
  "/api/recommendations",
  recommendationRoutes
);// ============================================================
// SOCKET.IO
// ============================================================


const server = http.createServer(app);



export const io = new Server(server, {

  cors: {

    origin: [

      process.env.CLIENT_URL,

      "http://localhost:5173",

      "http://localhost:3000",

      "https://hussein-mboya-tours.vercel.app"

    ],

    credentials:true

  }

});




// Make Socket.IO available globally
// for notifications, payments, bookings etc.

global.io = io;




// ============================================================
// SOCKET CONNECTION EVENTS
// ============================================================


io.on(
  "connection",

  (socket)=>{


    console.log(
      `🔌 User connected: ${socket.id}`
    );





    // ========================================================
    // REGISTER USER SOCKET
    // ========================================================


    socket.on(
      "register",

      (userId)=>{


        if(!userId){

          return;

        }



        registerSocket(
          userId,
          socket.id
        );



        // Join personal room
        socket.join(
          userId.toString()
        );



        console.log(

          `👤 User ${userId} registered with socket ${socket.id}`

        );


      }

    );







    // ========================================================
    // JOIN USER ROOM
    // ========================================================


    socket.on(

      "join",

      (userId)=>{


        if(!userId){

          return;

        }



        socket.join(
          userId.toString()
        );



        console.log(

          `👥 User ${userId} joined room`

        );


      }

    );








    // ========================================================
    // DISCONNECT CLEANUP
    // ========================================================


    socket.on(

      "disconnect",

      ()=>{


        const userId =

        getUserIdBySocketId(
          socket.id
        );




        if(userId){


          removeSocket(
            userId
          );



          console.log(

            `🧹 Removed online user ${userId}`

          );


        }



        console.log(

          `❌ User disconnected: ${socket.id}`

        );


      }

    );



  }

);









// ============================================================
// ERROR HANDLING
// ============================================================


app.use(
  notFound
);



app.use(
  errorHandler
);









// ============================================================
// START SERVER
// ============================================================


server.listen(

  env.PORT,

  ()=>{


    console.log(

      `🚀 Hussein Mboya Tours API running on port ${env.PORT}`

    );


  }

);