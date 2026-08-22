import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import User from "../models/User.js";
import Staff from "../models/Staff.js";

/*
|--------------------------------------------------------------------------
| GET LOGGED IN USER PROFILE
|--------------------------------------------------------------------------
*/

export const getUserProfile = async (req, res, next) => {
  requireTenantId();
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("GET USER PROFILE ERROR:", error);
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| UPDATE LOGGED IN USER PROFILE
|--------------------------------------------------------------------------
*/

export const updateUserProfile = async (req, res, next) => {
    try {
        const allowedFields = ["name", "phone", "profileImage"];
        const update = {};

        for (const field of allowedFields) {
            if (req.body?.[field] !== undefined) {
                update[field] = req.body[field];
            }
        }

        if (update.name !== undefined && !String(update.name).trim()) {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty.",
            });
        }

        if (update.phone !== undefined && !String(update.phone).trim()) {
            return res.status(400).json({
                success: false,
                message: "Phone number cannot be empty.",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: update },
            { new: true, runValidators: true }
        )
            .select("-password")
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: user,
            user,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET ALL ACTIVE GUIDES
|--------------------------------------------------------------------------
*/

export const getGuides = async (req, res, next) => {
    try {
        /*
        |----------------------------------------------------------------------
        | Tour assignments reference Staff, not User.
        | Return Staff IDs so the assignment endpoint receives the correct
        | resource type.
        |----------------------------------------------------------------------
        */
        const guides = await Staff.find({
            position: "guide",
            status: "active",
            isActive: true,
            isDeleted: { $ne: true },
        })
            .select(
                "name email phone profileImage experience availability assignedTours position"
            )
            .sort({ name: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: guides.length,
            data: guides,
            guides,
        });
    } catch (error) {
        console.error("GET GUIDES ERROR:", error);
        next(error);
    }
};

export const deleteUser = async (req,res)=>{

try{

const user = await User.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);


if(!user){

return res.status(404).json({
success:false,
message:"User not found"
});

}


await user.deleteOne();


return res.json({

success:true,

message:"User deleted successfully"

});


}catch(error){

console.error(error);

res.status(500).json({

success:false,

message:error.message

});

}

};
