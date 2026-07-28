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

import destinationRoutes from "./routes/destinationRoutes.js";



// BOOKINGS

import bookingRoutes from "./routes/bookingRoutes.js";



// PAYMENTS

import mpesaRoutes from "./routes/mpesaRoutes.js";



// CUSTOMER

import invoiceRoutes from "./routes/invoiceRoutes.js";

import wishListRoutes from "./routes/wishlistRoutes.js";

import reviewRoutes from "./routes/reviewRoutes.js";



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





// ============================================================
// AGENT
// ============================================================


import agentRoutes from "./routes/agentRoutes.js";

import agentCustomerRoutes from "./routes/agentCustomerRoutes.js";

import agentPackageRoutes from "./routes/agentPackageRoutes.js";




// ============================================================
// GUIDE
// ============================================================


import guideRoutes from "./routes/guideRoutes.js";




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


connectDatabase();







// ============================================================
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
// SECURITY RATE LIMIT
// ============================================================


app.use(securityMonitor);



app.use(

rateLimit({

    windowMs:15 * 60 * 1000,

    max:200,

    message:

    "Too many requests. Please try again later."


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
// API ROUTES
// ============================================================


// AUTH

app.use(

"/api/auth",

authRoutes

);





// TOURS

app.use(

"/api/tours",

tourRoutes

);





// DESTINATIONS

app.use(

"/api/destinations",

destinationRoutes

);





// BOOKINGS

app.use(

"/api/bookings",

bookingRoutes

);





// MPESA

app.use(

"/api/mpesa",

mpesaRoutes

);





// INVOICES

app.use(

"/api/invoices",

invoiceRoutes

);





// WISHLIST

app.use(

"/api/wishlist",

wishListRoutes

);





// REVIEWS

app.use(

"/api/reviews",

reviewRoutes

);





// USERS

app.use(

"/api/users",

userRoutes

);





// ANALYTICS

app.use(

"/api/analytics",

analyticsRoutes

);







// ============================================================
// ADMIN AUTH
// ============================================================


app.use(

"/api/admin/auth",

adminAuthRoutes

);







// ============================================================
// ADMIN MANAGEMENT
// ============================================================


app.use(

"/api/admin",

adminRoutes

);



app.use(

"/api/admin/tours",

adminTourRoutes

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
// AGENT
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
// GUIDE
// ============================================================


app.use(

"/api/guide",

guideRoutes

);







// ============================================================
// TOUR MANAGER
// ============================================================


app.use(

"/api/tourmanager",

tourManagerRoutes

);







// ============================================================
// VEHICLES
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

);







// ============================================================
// SOCKET.IO
// ============================================================


const server = http.createServer(app);





const io = new Server(

server,

{

cors:{

    origin:allowedOrigins,

    credentials:true

}

}

);





global.io = io;






io.on(

"connection",

(socket)=>{


console.log(

`🔌 User connected: ${socket.id}`

);






socket.on(

"join",

(userId)=>{


socket.join(userId);



console.log(

`👤 User ${userId} joined room`

);


}

);






socket.on(

"disconnect",

()=>{


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


app.use(notFound);


app.use(errorHandler);







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