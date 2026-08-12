import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({
    database: "connected",
    collections: [],
    timestamp: new Date()
  });
});

export default router;
