import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({
    site: "Coherent Tours",
    maintenance: false,
    version: "1.0.0"
  });
});

export default router;
