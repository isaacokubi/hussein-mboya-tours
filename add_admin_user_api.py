from pathlib import Path

# -----------------------------
# Create adminUserController.js
# -----------------------------

controller = Path("server/controllers/adminUserController.js")

controller.write_text(r'''
import User from "../models/User.js";


export const getUsers = async (req, res, next) => {
  try {

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });


    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    next(error);
  }
};



export const updateUserStatus = async (req, res, next) => {
  try {

    const { status } = req.body;


    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");


    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
};
''')

print("✅ Created adminUserController.js")


# -----------------------------
# Update adminRoutes.js imports
# -----------------------------

routes = Path("server/routes/adminRoutes.js")

text = routes.read_text()


if 'adminUserController.js' not in text:

    text = text.replace(
        'import adminMiddleware from "../middleware/adminMiddleware.js";',
        '''import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  getUsers,
  updateUserStatus
} from "../controllers/adminUserController.js";'''
    )


# -----------------------------
# Add routes
# -----------------------------

if 'router.get(\n  "/users"' not in text:

    text = text.replace(
        'export default router;',
        '''
/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

router.get(
  "/users",
  getUsers
);


router.put(
  "/users/:id/status",
  updateUserStatus
);


export default router;
'''
    )


routes.write_text(text)

print("✅ Updated adminRoutes.js")

print("""
DONE.

Next:
1. Restart backend
2. Test:

curl http://localhost:5000/api/admin/users \\
-H "Authorization: Bearer YOUR_TOKEN"
""")
