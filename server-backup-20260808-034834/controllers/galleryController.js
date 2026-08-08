import Gallery from "../models/Gallery.js";



export const getFeaturedGallery = async(req,res,next)=>{


try{


const images = await Gallery.find({

active:true,

featured:true

})

.sort({

createdAt:-1

})

.limit(12);




res.json({

success:true,

images

});


}

catch(error){

next(error);

}


};