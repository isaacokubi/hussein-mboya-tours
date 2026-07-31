// server/routes/documentRoutes.js

import express from "express";

import {
  uploadDocument,
} from "../controllers/documentController.js";

import upload from "../middleware/uploadMiddleware.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
|
| All document uploads require authentication.
|
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| DOCUMENTS
|--------------------------------------------------------------------------
*/

/**
 * POST /api/documents/:id
 *
 * Upload a document for the specified resource.
 *
 * Form Data:
 * document
 */
router.post(
  "/:id",
  upload.single("document"),
  uploadDocument
);

export default router;