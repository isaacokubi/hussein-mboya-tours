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
            role: "guide",
            status: "active",
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