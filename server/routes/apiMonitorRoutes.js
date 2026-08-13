import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({
    success: true,
    api: {
      status: "healthy",
      service: "Coherent Tours API",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    }
  });
});

export default router;
