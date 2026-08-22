import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import TourCategory from "../models/TourCategory.js";



/*
|--------------------------------------------------------------------------
| GET ACTIVE TOUR CATEGORIES
|--------------------------------------------------------------------------
*/

export const getCategories = async(req,res,next)=>{
  requireTenantId();


try{


const categories = await TourCategory.find({

active:true

})

.sort({

createdAt:-1

});




res.json({

success:true,

categories

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

