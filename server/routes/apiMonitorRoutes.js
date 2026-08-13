import express from "express";

const router = express.Router();

router.get("/", async (req,res)=>{
  res.json({
    status:"healthy",
    service:"API Service",
    server:"running",
    timestamp:new Date(),
    uptime:process.uptime()
  });
});

export default router;
