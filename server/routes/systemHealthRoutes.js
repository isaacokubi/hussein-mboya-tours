import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/health", async (req,res)=>{

    const memory = process.memoryUsage();

    const database =
        mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected";


    res.json({

        status:"healthy",

        server:"running",

        nodeVersion:process.version,

        environment:
            process.env.NODE_ENV || "development",

        uptime:
            Math.floor(process.uptime()),

        timestamp:
            new Date().toISOString(),


        database,


        memory:{
            used:
            Math.round(memory.heapUsed / 1024 / 1024)
            +" MB",

            total:
            Math.round(memory.heapTotal / 1024 / 1024)
            +" MB"
        },


        platform:{
            os:process.platform,
            architecture:process.arch
        }

    });

});



router.get("/admin/system-health", async (req,res)=>{

    const memory = process.memoryUsage();

    const database =
        mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected";

    res.json({

        status:"healthy",
        server:"running",
        nodeVersion:process.version,
        environment:
            process.env.NODE_ENV || "development",
        uptime:
            Math.floor(process.uptime()),
        timestamp:
            new Date().toISOString(),

        database,

        memory:{
            used:
            Math.round(memory.heapUsed / 1024 / 1024)+" MB",

            total:
            Math.round(memory.heapTotal / 1024 / 1024)+" MB"
        },

        platform:{
            os:process.platform,
            architecture:process.arch
        }

    });

});


export default router;
