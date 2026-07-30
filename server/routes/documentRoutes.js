import express from "express";


import upload
from "../middleware/uploadMiddleware.js";


import {
uploadDocument
}
from "../controllers/documentController.js";


const router =
express.Router();



router.post(

"/:id",

upload.single(
"document"
),

uploadDocument

);



export default router;