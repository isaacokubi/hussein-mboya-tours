/**
 * Purpose: security Controller HTTP controller. Main declarations: getSecurityStatus, getSecurityEvents.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../services/securityService.js so this module can use its exported dependencies.
import securityService from "../services/securityService.js";

// Declare getSecurityStatus for use by the surrounding module or function.
export const getSecurityStatus = async (req,res)=>{
  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare data for use by the surrounding module or function.
    const data = await securityService.getSecurityStatus();

    // Perform the side effect or state update expressed on the following line.
    res.json({
      success:true,
      data
    });

  } catch(error){

    // Perform the side effect or state update expressed on the following line.
    res.status(500).json({
      success:false,
      message: publicErrorMessage(error)
    });

  }
};


// Declare getSecurityEvents for use by the surrounding module or function.
export const getSecurityEvents = async (req,res)=>{
  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare data for use by the surrounding module or function.
    const data = await securityService.getSecurityEvents();

    // Perform the side effect or state update expressed on the following line.
    res.json({
      success:true,
      data
    });

  } catch(error){

    // Perform the side effect or state update expressed on the following line.
    res.status(500).json({
      success:false,
      message: publicErrorMessage(error)
    });

  }
};
