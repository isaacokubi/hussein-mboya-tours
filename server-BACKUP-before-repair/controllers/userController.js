import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| GET LOGGED IN USER PROFILE
|--------------------------------------------------------------------------
*/

export const getUserProfile = async (req, res, next) => {
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
| GET ALL ACTIVE GUIDES
|--------------------------------------------------------------------------
*/

export const getGuides = async (req, res, next) => {
    try {
        const guides = await User.find({
            role: { $in: ["guide", "tour_guide"] },
            status: "active",
            isActive: { $ne: false },
        })
            .select("name email phone profileImage")
            .sort({ name: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: guides.length,
            data: guides,
        });
    } catch (error) {
        console.error("GET GUIDES ERROR:", error);
        next(error);
    }
};
export const deleteUser = async (req,res)=>{

try{

const user = await User.findById(req.params.id);


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
