import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import Gallery from "../models/Gallery.js";



export const getFeaturedGallery = async(req,res,next)=>{
  requireTenantId();


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



/*
 Auto completed fallback handlers
*/

export const healthCheck = async(req,res)=>{
    res.json({
        success:true,
        message:"Module operational"
    });
};

