import { authorize } from "../middleware/permissionMiddleware.js";
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
protect
}
from "../middleware/authMiddleware.js";


import adminMiddleware
from "../middleware/adminMiddleware.js";



const router =
express.Router();



router.use(protect);

router.use(adminMiddleware);

router.use(authorize("roles.manage"));



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



router.patch(
"/:id/permissions",
updatePermissions
);



export default router;
