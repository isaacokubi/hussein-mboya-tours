import { resolveTenant } from "../middleware/tenantMiddleware.js";

import express from "express";


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


import {
protect,
checkPermission
}
from "../middleware/authMiddleware.js";






const router = express.Router();

router.use(resolveTenant);



router.use(protect);



router.use(checkPermission("roles.manage"));



router.get(
"/",
getRoles
);

router.get(
"/permissions/all",
getPermissions
);



router.get(
"/:id",
getRole
);



router.post(
"/",
createRole
);



router.put(
"/:id",
updateRole
);

router.patch(
"/:id",
updateRole
);



router.delete(
"/:id",
deleteRole
);



router.put(
"/:id/permissions",
updatePermissions
);



export default router;
