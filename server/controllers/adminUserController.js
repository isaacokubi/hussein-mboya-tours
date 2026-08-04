
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
