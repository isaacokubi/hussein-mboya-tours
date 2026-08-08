from pathlib import Path
import shutil
from datetime import datetime


file = Path("routes/aiRoutes.js")

backup = Path(
    f"../.ai-route-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
)

backup.mkdir(exist_ok=True)

shutil.copy2(
    file,
    backup / "aiRoutes.js"
)


content = file.read_text()


marker = "const router = express.Router();"


if marker in content:

    body = content.split(marker,1)[1]

    fixed = """import express from "express";

import {
    protect
} from "../middleware/authMiddleware.js";


const rateLimiter = (req,res,next)=>{
    next();
};


const router = express.Router();


"""

    fixed += marker + body


else:

    fixed = """import express from "express";

import {
    protect
} from "../middleware/authMiddleware.js";


const rateLimiter = (req,res,next)=>{
    next();
};


const router = express.Router();

"""

    fixed += content



file.write_text(fixed)


print("AI ROUTE REPAIRED")
print("Backup:", backup)
