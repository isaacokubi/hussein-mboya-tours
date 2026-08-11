import HeroSlide from "../models/HeroSlide.js";


export const getHeroSlides = async (req, res) => {

  try {

    const slides = await HeroSlide.find();


    console.log("ALL HERO SLIDES:", slides);


    res.status(200).json({

      success: true,

      slides

    });


  } catch (error) {


    console.log("HERO SLIDE ERROR:", error);


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

