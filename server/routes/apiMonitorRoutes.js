import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({
    success: true,
    status: "online",
    service: "API Service",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

export default router;
