
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

