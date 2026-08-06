import User from "../models/User.js";

export const getAgents = async (req, res) => {
  try {

    const agents = await User.find({
      role: "agent"
    }).select("-password");

    res.json({
      success: true,
      data: agents
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      message:error.message
    });

  }
};
