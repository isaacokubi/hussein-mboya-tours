import HeroSlide from "../models/HeroSlide.js";



export const getHeroSlides = async(req,res,next)=>{


try{


const slides = await HeroSlide.find({

active:true

})

.sort({

order:1

});



res.json({

success:true,

slides

});


}

catch(error){

next(error);

}


};