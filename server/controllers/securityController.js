import { mergeTenantFilter } from "../tenancy/context.js";
import securityService from "../services/securityService.js";

export const getSecurityStatus = async (req,res)=>{
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


export const getSecurityEvents = async (req,res)=>{
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
