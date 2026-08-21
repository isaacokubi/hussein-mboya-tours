#!/bin/bash

set -e

cd server

DATE=$(date +%Y%m%d_%H%M%S)

echo "Creating backup..."
mkdir -p backups/auth_fix_$DATE
cp controllers/authController.js backups/auth_fix_$DATE/

echo "Rebuilding authController.js..."

cat > controllers/authController.js <<'JS'
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import buildPermissions from "../utils/buildPermissions.js";
import { normalizeRole } from "../utils/roleUtils.js";


export const login = async (req, res) => {
  try {

    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body?.password || "");

    const user = await User.findOne({ email })
      .select("+password")
      .populate({
        path: "roleId",
        populate: {
          path: "permissions"
        }
      })
      .populate("permissionsOverride");


    if (!user || !(await user.matchPassword(password))) {

      return res.status(401).json({
        success:false,
        message:"Invalid email or password"
      });

    }


    const role = normalizeRole(
      user.roleId?.name ||
      user.role ||
      user.legacyRole
    );


    const permissions = buildPermissions(user);


    const token = generateToken({

      _id: user._id,

      roleId: user.roleId?._id || user.roleId,

      role,

      email:user.email,

      tenantId:user.tenantId || null,

      permissions

    });



    return res.json({

      success:true,

      token,

      user:{

        _id:user._id,

        name:user.name,

        email:user.email,

        phone:user.phone,

        role,

        tenantId:user.tenantId || null,

        permissions,

        status:user.status

      }

    });


  } catch(error){

    console.error("LOGIN ERROR:",error);

    return res.status(500).json({
      success:false,
      message:"Login failed"
    });

  }

};



export const customerLogin = login;
export default login;
JS


echo "Checking syntax..."

node --check controllers/authController.js

node --check controllers/adminAuthController.js

echo ""
echo "AUTH CONTROLLER FIXED"
echo "Backup:"
echo "backups/auth_fix_$DATE"

