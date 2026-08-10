
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

    if (!["active", "inactive", "suspended", "blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user status.",
      });
    }

    if (req.params.id === req.user?._id?.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot disable your own account.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status,
        isActive: status === "active"
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      message: `User ${status === "active" ? "enabled" : "disabled"} successfully.`,
      data: user
    });

  } catch (error) {
    next(error);
  }
};


// DELETE USER
export const deleteUser = async (req,res)=>{

  try {

    const user = await User.findById(req.params.id);


    if(!user){

      return res.status(404).json({
        success:false,
        message:"User not found"
      });

    }


    await User.findByIdAndDelete(req.params.id);


    res.json({

      success:true,

      message:"User deleted successfully"

    });


  } catch(error){

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};

