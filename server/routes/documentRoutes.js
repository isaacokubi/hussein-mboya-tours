/**
 * Purpose: document Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";

// server/routes/documentRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/documentController.js so this module can use its exported dependencies.
import {
  uploadDocument,
} from "../controllers/documentController.js";

// Load ../middleware/uploadMiddleware.js so this module can use its exported dependencies.
import upload from "../middleware/uploadMiddleware.js";

// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
  protect,
} from "../middleware/authMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
|
| All document uploads require authentication.
|
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
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
// Perform the side effect or state update expressed on the following line.
router.post(
  "/:id",
  upload.single("document"),
  uploadDocument
);

export default router;
