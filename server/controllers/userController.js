/**
 * Purpose: user Controller HTTP controller. Main declarations: getUserProfile, updateUserProfile, getGuides, deleteUser.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";

/*
|--------------------------------------------------------------------------
| GET LOGGED IN USER PROFILE
|--------------------------------------------------------------------------
*/

// Declare getUserProfile for use by the surrounding module or function.
export const getUserProfile = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
    // Run this operation with a dedicated error-handling path for failures.
    try {
        // Declare user for use by the surrounding module or function.
        const user = await User.findById(req.user._id)
            .select("-password")
            .lean();

        // Check the condition (!user) and run the matching branch.
        if (!user) {
            // Return the result of res.status(404).json() to the caller.
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Return the result of res.status(200).json() to the caller.
        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        console.error("GET USER PROFILE ERROR:", error);
        // Perform the side effect or state update expressed on the following line.
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| UPDATE LOGGED IN USER PROFILE
|--------------------------------------------------------------------------
*/

// Declare updateUserProfile for use by the surrounding module or function.
export const updateUserProfile = async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
        // Declare allowedFields for use by the surrounding module or function.
        const allowedFields = ["name", "phone", "profileImage"];
        // Declare update for use by the surrounding module or function.
        const update = {};

        // Repeat the enclosed work for each required iteration.
        for (const field of allowedFields) {
            // Check the condition (req.body?.[field] !== undefined) and run the matching branch.
            if (req.body?.[field] !== undefined) {
                // Perform the side effect or state update expressed on the following line.
                update[field] = req.body[field];
            }
        }

        // Check the condition (update.name !== undefined && !String(update.name).trim()) and run the matching branch.
        if (update.name !== undefined && !String(update.name).trim()) {
            // Return the result of res.status(400).json() to the caller.
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty.",
            });
        }

        // Check the condition (update.phone !== undefined && !String(update.phone).trim()) and run the matching branch.
        if (update.phone !== undefined && !String(update.phone).trim()) {
            // Return the result of res.status(400).json() to the caller.
            return res.status(400).json({
                success: false,
                message: "Phone number cannot be empty.",
            });
        }

        // Declare user for use by the surrounding module or function.
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: update },
            { new: true, runValidators: true }
        )
            .select("-password")
            .lean();

        // Check the condition (!user) and run the matching branch.
        if (!user) {
            // Return the result of res.status(404).json() to the caller.
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Return the result of res.status(200).json() to the caller.
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: user,
            user,
        });
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET ALL ACTIVE GUIDES
|--------------------------------------------------------------------------
*/

// Declare getGuides for use by the surrounding module or function.
export const getGuides = async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
        /*
        |----------------------------------------------------------------------
        | Tour assignments reference Staff, not User.
        | Return Staff IDs so the assignment endpoint receives the correct
        | resource type.
        |----------------------------------------------------------------------
        */
        // Declare guides for use by the surrounding module or function.
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

        // Return the result of res.status(200).json() to the caller.
        return res.status(200).json({
            success: true,
            count: guides.length,
            data: guides,
            guides,
        });
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        console.error("GET GUIDES ERROR:", error);
        // Perform the side effect or state update expressed on the following line.
        next(error);
    }
};

// Declare deleteUser for use by the surrounding module or function.
export const deleteUser = async (req,res)=>{

// Run this operation with a dedicated error-handling path for failures.
try{

// Declare user for use by the surrounding module or function.
const user = await User.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);


// Check the condition (!user) and run the matching branch.
if(!user){

// Return the result of res.status(404).json() to the caller.
return res.status(404).json({
success:false,
message:"User not found"
});

}


// Perform the side effect or state update expressed on the following line.
await user.deleteOne();


// Return the result of res.json() to the caller.
return res.json({

success:true,

message:"User deleted successfully"

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
console.error(error);

// Perform the side effect or state update expressed on the following line.
res.status(500).json({

success:false,

message: publicErrorMessage(error)

});

}

};
