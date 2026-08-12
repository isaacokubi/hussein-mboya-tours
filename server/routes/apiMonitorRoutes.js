import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({
    api: "online",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date()
  });
});

export default router;
