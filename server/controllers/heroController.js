import { mergeTenantFilter } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import HeroSlide from "../models/HeroSlide.js";


export const getHeroSlides = async (req, res) => {

  try {

    const slides = await HeroSlide.find(tenantFilter(req));


    // debug removed


    res.status(200).json({

      success: true,

      slides

    });


  } catch (error) {


    // debug removed


    res.status(500).json({

      success: false,

      message: error.message

    });


  }

};



/*
 Auto completed fallback handlers
*/

export const healthCheck = async(req,res)=>{
    res.json({
        success:true,
        message:"Module operational"
    });
};

