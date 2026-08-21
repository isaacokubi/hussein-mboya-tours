import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import buildPermissions from "../utils/buildPermissions.js";
import { normalizeRole } from "../utils/roleUtils.js";


export const login = async (req, res) => {
  try {

    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    console.log("LOGIN DEBUG TENANT:", {
      tenantId: req.tenantId,
      tenant: req.tenant?.slug,
      email
    });

    const password = String(req.body?.password || "");

    const tenantId =
      req.tenantId ||
      req.headers["x-tenant-id"] ||
      null;

    const userQuery = {
      email
    };

    if (tenantId) {
      userQuery.tenantId = tenantId;
    }

    console.log("LOGIN QUERY:", userQuery);

    const user = await User.findOne(userQuery)
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

      email: user.email,
      tenantId: user.tenantId || null,

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


export const register = async (req,res,next)=>{
  try{
    const {name,email,phone,password}=req.body||{};

    if(!name||!email||!phone||!password){
      return res.status(400).json({
        success:false,
        message:"All fields are required."
      });
    }

    const exists = await User.findOne({
      $or:[
        {email:String(email).toLowerCase()},
        {phone}
      ]
    });

    if(exists){
      return res.status(400).json({
        success:false,
        message:"User already exists."
      });
    }

    const user = await User.create({
      name,
      email:String(email).toLowerCase(),
      phone,
      password,
      role:"customer",
      legacyRole:"customer",
      tenantId:req.tenantId || null,
      status:"active"
    });


    const token = generateToken({
      _id:user._id,
      role:"customer",
      email:user.email,
      tenantId:user.tenantId || null,
      permissions:[]
    });


    return res.status(201).json({
      success:true,
      token,
      user
    });


  }catch(error){
    next(error);
  }
};



export const getMe = async(req,res)=>{
  const user = await User.findById(req.user._id)
    .populate("roleId")
    .populate("tenantId");

  if(!user){
    return res.status(404).json({
      success:false,
      message:"User not found"
    });
  }

  res.json({
    success:true,
    user:{
      ...user.toObject(),
      tenantId:user.tenantId?._id || null,
      tenantSlug:user.tenantId?.slug || null
    }
  });
};



export const changePassword = async(req,res,next)=>{
try{

const user=await User.findById(req.user._id)
.select("+password");

if(!user)
return res.status(404).json({
 success:false,
 message:"User not found"
});


const ok=await user.matchPassword(
 req.body.currentPassword
);

if(!ok)
return res.status(401).json({
 success:false,
 message:"Current password incorrect"
});


user.password=req.body.newPassword;

await user.save();


res.json({
 success:true,
 message:"Password changed successfully"
});


}catch(e){
next(e);
}

};



export const requestPasswordReset = async(req,res)=>{
res.json({
success:true,
message:"Reset code request accepted"
});
};



export const resetPasswordWithCode = async(req,res)=>{
res.json({
success:true,
message:"Password reset accepted"
});
};

