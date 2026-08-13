const securityService = require("../services/securityService");

exports.getSecurityStatus = async (req,res)=>{
  try {
    const data = await securityService.getSecurityStatus();
    res.json({
      success:true,
      data
    });
  } catch(error){
    res.status(500).json({
      success:false,
      message:error.message
    });
  }
};

exports.getSecurityEvents = async (req,res)=>{
  try {
    const data = await securityService.getSecurityEvents();
    res.json({
      success:true,
      data
    });
  } catch(error){
    res.status(500).json({
      success:false,
      message:error.message
    });
  }
};
