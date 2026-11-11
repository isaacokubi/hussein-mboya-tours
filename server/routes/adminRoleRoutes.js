/**
 * Purpose: admin Role Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";

// Load express so this module can use its exported dependencies.
import express from "express";


// Load ../controllers/adminRoleController.js so this module can use its exported dependencies.
import {

getRoles,
getPermissions,
getRole,
createRole,
updateRole,
deleteRole,
updatePermissions

}

from "../controllers/adminRoleController.js";


// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
protect,
checkPermission
}
from "../middleware/authMiddleware.js";






// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);



// Perform the side effect or state update expressed on the following line.
router.use(protect);



// Perform the side effect or state update expressed on the following line.
router.use(checkPermission("roles.manage"));



// Perform the side effect or state update expressed on the following line.
router.get(
"/",
getRoles
);

// Perform the side effect or state update expressed on the following line.
router.get(
"/permissions/all",
getPermissions
);



// Perform the side effect or state update expressed on the following line.
router.get(
"/:id",
getRole
);



// Perform the side effect or state update expressed on the following line.
router.post(
"/",
createRole
);



// Perform the side effect or state update expressed on the following line.
router.put(
"/:id",
updateRole
);

// Perform the side effect or state update expressed on the following line.
router.patch(
"/:id",
updateRole
);



// Perform the side effect or state update expressed on the following line.
router.delete(
"/:id",
deleteRole
);



// Perform the side effect or state update expressed on the following line.
router.put(
"/:id/permissions",
updatePermissions
);



export default router;
