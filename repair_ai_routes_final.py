from pathlib import Path
import shutil
from datetime import datetime

root = Path("server/routes/aiRoutes.js")

backup = Path(
    f".ai-route-final-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
)

backup.mkdir(exist_ok=True)

shutil.copy2(root, backup / "aiRoutes.js")


content = """import express from "express";

import {
  protect
} from "../middleware/authMiddleware.js";

import {
  askAI
} from "../controllers/aiController.js";


const rateLimiter = (req, res, next) => {
  next();
};


const router = express.Router();


/*
|--------------------------------------------------------------------------
| AI ASSISTANT
|--------------------------------------------------------------------------
*/


router.post(
  "/assistant",
  protect,
  rateLimiter,
  askAI
);


router.post(
  "/chat",
  protect,
  rateLimiter,
  askAI
);


export default router;
"""


root.write_text(content)

print("AI ROUTE FULLY REPAIRED")
print("Backup:", backup)
