import mongoose from "mongoose";

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
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const allowedStatuses = [
      "active",
      "inactive",
      "disabled",
      "suspended",
      "blocked",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user status",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        status,
        isActive: status === "active",
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};;


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

